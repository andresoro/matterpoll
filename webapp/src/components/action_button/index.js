// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {doPostAction} from 'mattermost-redux/actions/posts';

import ActionButton from './action_button';

function mapStateToProps(state) {
    console.log("userid", getCurrentUserId(state))
    return {
        currentUserId: getCurrentUserId(state),
    }
}
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            doPostAction,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionButton);
