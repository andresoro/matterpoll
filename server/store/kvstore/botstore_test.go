package kvstore

import (
	"testing"

	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin/plugintest"
	"github.com/matterpoll/matterpoll/server/utils/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBotStoreGetID(t *testing.T) {
	t.Run("all fine", func(t *testing.T) {
		api := &plugintest.API{}
		api.On("KVGet", botKey).Return([]byte(testutils.GetBotUserID()), nil)
		defer api.AssertExpectations(t)
		store := setupTestStore(api)

		botUserID, err := store.Bot().GetID()
		require.Nil(t, err)
		assert.Equal(t, testutils.GetBotUserID(), botUserID)
	})
	t.Run("KVGet() fails", func(t *testing.T) {
		api := &plugintest.API{}
		api.On("KVGet", botKey).Return([]byte{}, &model.AppError{})
		defer api.AssertExpectations(t)
		store := setupTestStore(api)

		botUserID, err := store.Bot().GetID()
		assert.NotNil(t, err)
		assert.Empty(t, botUserID)
	})
}

func TestBotStoreSaveID(t *testing.T) {
	t.Run("all fine", func(t *testing.T) {
		api := &plugintest.API{}
		api.On("KVSet", botKey, []byte(testutils.GetBotUserID())).Return(nil)
		defer api.AssertExpectations(t)
		store := setupTestStore(api)

		err := store.Bot().SaveID(testutils.GetBotUserID())
		assert.Nil(t, err)
	})
	t.Run("KVSet() fails", func(t *testing.T) {
		api := &plugintest.API{}
		api.On("KVSet", botKey, []byte(testutils.GetBotUserID())).Return(&model.AppError{})
		defer api.AssertExpectations(t)
		store := setupTestStore(api)

		err := store.Bot().SaveID(testutils.GetBotUserID())
		assert.NotNil(t, err)
	})
}
