// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {doPostAction} from 'mattermost-redux/actions/posts';
import {fetchVotedAnswers} from '../../actions'

import ActionView from './action_view';

function mapStateToProps(state) {
    const config = getConfig(state);
    return {
        siteUrl: config.SiteURL,
        currentUserId: getCurrentUserId(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            doPostAction,
            fetchVotedAnswers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionView);
