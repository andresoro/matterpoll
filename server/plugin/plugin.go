package plugin

import (
	"fmt"
	"io/ioutil"
	"path/filepath"
	"sync"

	"github.com/blang/semver"
	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
	"github.com/matterpoll/matterpoll/server/poll"
	"github.com/matterpoll/matterpoll/server/store"
	"github.com/matterpoll/matterpoll/server/store/kvstore"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"github.com/pkg/errors"
)

// MatterpollPlugin is the object to run the plugin
type MatterpollPlugin struct {
	plugin.MattermostPlugin
	botUserID string
	bundle    *i18n.Bundle
	router    *mux.Router
	Store     store.Store

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration
	ServerConfig  *model.Config
}

var botDescription = &i18n.Message{
	ID:    "bot.description",
	Other: "Poll Bot",
}

const (
	minimumServerVersion = "5.6.0" // TODO: Update to 5.10.0 once it's available

	botUserName    = "matterpoll"
	botDisplayName = "Matterpoll"
)

// OnActivate ensures a configuration is set and initializes the API
func (p *MatterpollPlugin) OnActivate() error {
	if err := p.checkServerVersion(); err != nil {
		return err
	}

	if p.ServerConfig.ServiceSettings.SiteURL == nil {
		return errors.New("siteURL is not set. Please set a siteURL and restart the plugin")
	}

	store, err := kvstore.NewStore(p.API, PluginVersion)
	if err != nil {
		return errors.Wrap(err, "failed to create store")
	}
	p.Store = store

	bundle, err := p.initBundle()
	if err != nil {
		return errors.Wrap(err, "failed to init localisation bundle")
	}
	p.bundle = bundle

	botID, err := p.ensureBotAccount()
	if err != nil {
		return errors.Wrap(err, "failed to ensure bot account")
	}
	p.botUserID = botID

	if err := p.setProfileImage(); err != nil {
		return errors.Wrap(err, "failed to set profile image")
	}

	p.router = p.InitAPI()

	return nil
}

// OnDeactivate unregisters the command
func (p *MatterpollPlugin) OnDeactivate() error {
	err := p.API.UnregisterCommand("", p.getConfiguration().Trigger)
	if err != nil {
		return errors.Wrap(err, "failed to dectivate command")
	}
	return nil
}

// checkServerVersion checks Mattermost Server has at least the required version
func (p *MatterpollPlugin) checkServerVersion() error {
	serverVersion, err := semver.Parse(p.API.GetServerVersion())
	if err != nil {
		return errors.Wrap(err, "failed to parse server version")
	}

	r := semver.MustParseRange(">=" + minimumServerVersion)
	if !r(serverVersion) {
		return fmt.Errorf("this plugin requires Mattermost v%s or later", minimumServerVersion)
	}

	return nil
}

// ensureBotAccount checks if the bot account exists and creates him if doesn't
func (p *MatterpollPlugin) ensureBotAccount() (string, error) {
	botUserID, err := p.Store.Bot().GetID()
	if err != nil {
		return "", errors.Wrap(err, "failed to get bot user from store")
	}
	if botUserID == "" {
		// Try to get existing bot
		user, appErr := p.API.GetUserByUsername(botUserName)
		if appErr != nil && appErr.StatusCode != 404 {
			return "", errors.Wrap(appErr, "failed to get user")
		}

		if user != nil {
			// Try to use existing user account
			if !user.IsBot {
				return "", errors.Errorf("normal user account with username %s allready exists", botUserName)
			}
			botUserID = user.Id
		} else {
			// Creating a new bot
			bot := &model.Bot{
				Username:    botUserName,
				DisplayName: botDisplayName,
			}

			rbot, appErr := p.API.CreateBot(bot)
			if appErr != nil {
				return "", errors.Wrap(appErr, "failed to create bot account")
			}
			botUserID = rbot.UserId
		}
		if err = p.Store.Bot().SaveID(botUserID); err != nil {
			return "", errors.Wrap(err, "failed to store bot id to store")
		}
	}

	// Update description with server local
	publicLocalizer := p.getServerLocalizer()
	description := p.LocalizeDefaultMessage(publicLocalizer, botDescription)
	botPatch := &model.BotPatch{
		Description: &description,
	}

	if _, appErr := p.API.PatchBot(botUserID, botPatch); appErr != nil {
		return "", errors.Wrap(appErr, "failed to patch bot description")
	}

	return botUserID, nil
}

// setProfileImage set the profile image of the bot account
func (p *MatterpollPlugin) setProfileImage() error {
	bundlePath, err := p.API.GetBundlePath()
	if err != nil {
		return errors.Wrap(err, "failed to get bundle path")
	}

	profileImage, err := ioutil.ReadFile(filepath.Join(bundlePath, "assets", "logo_dark.png"))
	if err != nil {
		return errors.Wrap(err, "failed to read profile image")
	}
	if appErr := p.API.SetProfileImage(p.botUserID, profileImage); appErr != nil {
		return errors.Wrap(err, "failed to set profile image")
	}
	return nil
}

// ConvertUserIDToDisplayName returns the display name to a given user ID
func (p *MatterpollPlugin) ConvertUserIDToDisplayName(userID string) (string, *model.AppError) {
	user, err := p.API.GetUser(userID)
	if err != nil {
		return "", err
	}
	displayName := user.GetDisplayName(model.SHOW_USERNAME)
	displayName = "@" + displayName
	return displayName, nil
}

// ConvertCreatorIDToDisplayName returns the display name to a given user ID of a poll creator
func (p *MatterpollPlugin) ConvertCreatorIDToDisplayName(creatorID string) (string, *model.AppError) {
	user, err := p.API.GetUser(creatorID)
	if err != nil {
		return "", err
	}
	displayName := user.GetDisplayName(model.SHOW_NICKNAME_FULLNAME)
	return displayName, nil
}

// HasPermission checks if a given user has the permission to end or delete a given poll
func (p *MatterpollPlugin) HasPermission(poll *poll.Poll, issuerID string) (bool, *model.AppError) {
	if issuerID == poll.Creator {
		return true, nil
	}

	user, appErr := p.API.GetUser(issuerID)
	if appErr != nil {
		return false, appErr
	}
	if user.IsInRole(model.SYSTEM_ADMIN_ROLE_ID) {
		return true, nil
	}
	return false, nil
}

func (p *MatterpollPlugin) SendEphemeralPost(channelID, userID, message string) {
	// This is mostly taken from https://github.com/mattermost/mattermost-server/blob/master/app/command.go#L304
	ephemeralPost := &model.Post{}
	ephemeralPost.ChannelId = channelID
	ephemeralPost.UserId = userID
	ephemeralPost.Message = message
	ephemeralPost.AddProp("override_username", responseUsername)
	ephemeralPost.AddProp("override_icon_url", fmt.Sprintf(responseIconURL, *p.ServerConfig.ServiceSettings.SiteURL, PluginId))
	ephemeralPost.AddProp("from_webhook", "true")
	_ = p.API.SendEphemeralPost(userID, ephemeralPost)
}
