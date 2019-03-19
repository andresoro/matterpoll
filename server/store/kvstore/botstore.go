package kvstore

import (
	"github.com/mattermost/mattermost-server/plugin"
)

// BotStore allows to access information about the bot account in the KV Store.
type BotStore struct {
	api plugin.API
}

const botKey = "bot_id"

// GetID returns the userID of the bot account.
func (s *BotStore) GetID() (string, error) {
	b, err := s.api.KVGet(botKey)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// SaveID sets the userID of the bot account
func (s *BotStore) SaveID(id string) error {
	err := s.api.KVSet(botKey, []byte(id))
	if err != nil {
		return err
	}
	return nil
}
