import React from 'react';
import PropTypes from 'prop-types';

import ActionButton from './action_button';

export default class ActionView extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        attachment: PropTypes.object.isRequired,
    }

    render() {
        const actions = this.props.attachment.actions;
        if (!actions || !actions.length) {
            return '';
        }
        const answers = this.props.post.props.answers || {};

        const content = [];

        actions.forEach((action) => {
            if (!action.id || !action.name) {
                return;
            }
            const voters = answers[action.name] || [];

            switch (action.type) {
            case 'button':
                content.push(
                    <ActionButton
                        key={action.id}
                        postId={this.props.post.id}
                        action={action}
                        voters={voters}
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