import React from 'react';
import PropTypes from 'prop-types';

import ActionButton from './action_button';

export default class ActionView extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        attachment: PropTypes.object.isRequired,
        siteUrl: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,

        actions: PropTypes.shape({
            doPostAction: PropTypes.func.isRequired,
            fetchVotedAnswers: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        this.props.actions.fetchVotedAnswers(this.props.siteUrl, this.props.post.props.poll_id, this.props.currentUserId);
    }

    render() {
        const actions = this.props.attachment.actions;
        if (!actions || !actions.length) {
            return '';
        }
        const content = [];

        actions.forEach((action) => {
            if (!action.id || !action.name) {
                return;
            }
            switch (action.type) {
            case 'button':
                content.push(
                    <ActionButton
                        key={action.id}
                        action={action}
                        handleAction={this.handleAction}
                        postId={this.props.post.id}
                        pollId={this.props.post.props.poll_id}
                        userId={this.props.currentUserId}
                    />
                );
                break;
            default:
                break;
            }
        });

        return (
            <div
                className='attachment-actions'
            >
                {content}
            </div>
        );
    }
}