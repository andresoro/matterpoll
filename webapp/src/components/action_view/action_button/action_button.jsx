// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class ActionButton extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string,
        postId: PropTypes.string.isRequired,
        action: PropTypes.object.isRequired,
        voters: PropTypes.array.isRequired,

        actions: PropTypes.shape({
            doPostAction: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleAction = (e) => {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id');
        this.props.actions.doPostAction(this.props.postId, actionId);
    };

    render() {
        const {action, voters, currentUserId} = this.props;
        const voted = voters.includes(currentUserId);

        return (
            <button
                data-action-id={action.id}
                key={action.id}
                onClick={this.handleAction}
                style={voted ? {'background-color': 'red'} : {}}
            >
                {action.name}
            </button>
        );
    }
}
