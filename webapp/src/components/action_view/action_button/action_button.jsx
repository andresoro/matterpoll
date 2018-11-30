// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class ActionButton extends React.PureComponent {
    static propTypes = {
        action: PropTypes.object.isRequired,
        postId: PropTypes.string.isRequired,
        pollId: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        siteUrl: PropTypes.string.isRequired,
        votedAnswers: PropTypes.array.isRequired,
        handleAction: PropTypes.func.isRequired,

        actions: PropTypes.shape({
            voteAnswer: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleAction = (e) => {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id');
        this.props.actions.voteAnswer(
            this.props.siteUrl,
            this.props.postId, 
            actionId,
            this.props.pollId,
            this.props.userId,
        );
    };

    
    render() {
        const {action, pollId} = this.props;
        const voted = this.props.votedAnswers || {};
        const answers = voted[pollId] || {};
        let style = {};
        if (answers.voted_answers && answers.voted_answers.includes(action.name)) {
            style = {
                backgroundColor: 'red',
            }
        }

        return (
            <button
                data-action-id={action.id}
                key={action.id}
                onClick={this.handleAction}
                style={style}
            >
                {action.name}
            </button>
        );
    }
}
