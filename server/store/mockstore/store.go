package mockstore

import (
	"github.com/matterpoll/matterpoll/server/store"
	"github.com/matterpoll/matterpoll/server/store/mockstore/mocks"
	"github.com/stretchr/testify/mock"
)

type Store struct {
	BotStore    mocks.BotStore
	PollStore   mocks.PollStore
	SystemStore mocks.SystemStore
}

func (s *Store) Bot() store.BotStore       { return &s.BotStore }
func (s *Store) Poll() store.PollStore     { return &s.PollStore }
func (s *Store) System() store.SystemStore { return &s.SystemStore }

func (s *Store) AssertExpectations(t mock.TestingT) {
	s.BotStore.AssertExpectations(t)
	s.PollStore.AssertExpectations(t)
	s.SystemStore.AssertExpectations(t)
}
