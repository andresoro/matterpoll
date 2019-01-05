import PropTypes from 'prop-types';
import React from 'react';

export default class ActionButton extends React.PureComponent {
    static propTypes = {
        action: PropTypes.object.isRequired,
        postId: PropTypes.string.isRequired,
        hasVoted: PropTypes.bool.isRequired,

        actions: PropTypes.shape({
            voteAnswer: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleAction = (e) => {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id');
        this.props.actions.voteAnswer(
            this.props.postId,
            actionId,
        );
    };

    render() {
        const {action} = this.props;
        let style = {};
        if (this.props.hasVoted) {
            style = {
                backgroundColor: 'red',
            };
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
