import {combineReducers} from 'redux';

import {FETCH_VOTED_ANSWERS} from './actions';

const votedAnswers = (state = {}, action) => {
    switch (action.type) {
    case FETCH_VOTED_ANSWERS:
        if (action.data) {
            const nextState = {...state};
            if (!action.data.poll_id) {
                return state;
            }
            // TODO: When is this props removed? Must implement the action for Delete/End poll?
            nextState[action.data.poll_id] = action.data;
            return nextState;
        }
        return state;
    default:
        return state;
    }
};

export default combineReducers({
    votedAnswers,
});