package kvstore

import (
	"github.com/mattermost/mattermost-server/plugin"
	"github.com/matterpoll/matterpoll/server/store"
)

// Store is an interface to interact with the KV Store.
type Store struct {
	api         plugin.API
	botStore    BotStore
	pollStore   PollStore
	systemStore SystemStore
}

// NewStore returns a fresh store and upgrades the db from the given schema version.
func NewStore(api plugin.API, pluginVersion string) (store.Store, error) {
	store := Store{
		api:         api,
		botStore:    BotStore{api: api},
		pollStore:   PollStore{api: api},
		systemStore: SystemStore{api: api},
	}
	err := store.UpdateDatabase(pluginVersion)
	if err != nil {
		return nil, err
	}

	return &store, nil
}

// Poll returns the Bot Store
func (s *Store) Bot() store.BotStore { return &s.botStore }

// Poll returns the Poll Store
func (s *Store) Poll() store.PollStore { return &s.pollStore }

// System returns the System Store
func (s *Store) System() store.SystemStore { return &s.systemStore }
