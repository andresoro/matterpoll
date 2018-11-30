import Manifest from './manifest'

import {doPostAction} from 'mattermost-redux/actions/posts';

export const VOTE_ANSWER = Manifest.PluginId + '_vote_answer';
export const FETCH_VOTED_ANSWERS = Manifest.PluginId + '_fetch_voted_answers';

export const voteAnswer = (siteUrl, postId, actionId, pollId, userId) => async (dispatch) => {
    return dispatch(doPostAction(postId, actionId)).then(()=> {
        return dispatch(fetchVotedAnswers(siteUrl, pollId, userId))
    })
}

export const fetchVotedAnswers = (siteUrl, pollId, userId) => async (dispatch) => {
    if (pollId === undefined || pollId === '') {
        return 
    }

    let url = siteUrl;
    // TODO: Is this check needed? 
    if (!url.endsWith('/')) {
        url += '/';
    }
    // TODO: ugly...
    url = url + 'plugins/' + Manifest.PluginId + '/api/v1/polls/' + pollId + '/users/' + userId + '/voted';
    // TODO: Handle error.
    return fetch(url).then((r) => r.json()).then((r) => {
        dispatch({
            type: FETCH_VOTED_ANSWERS,
            data: r,
        })
    });
}
