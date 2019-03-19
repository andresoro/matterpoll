package store

import "github.com/matterpoll/matterpoll/server/poll"

// Store allows the interaction with some kind of store.
type Store interface {
	Bot() BotStore
	Poll() PollStore
	System() SystemStore
}

// BotStore store information about the bot account
type BotStore interface {
	GetID() (string, error)
	SaveID(id string) error
}

// PollStore allows the access polls in the store.
type PollStore interface {
	Get(id string) (*poll.Poll, error)
	Save(poll *poll.Poll) error
	Delete(poll *poll.Poll) error
}

// SystemStore allows to access system informations in the store.
type SystemStore interface {
	GetVersion() (string, error)
	SaveVersion(version string) error
}
