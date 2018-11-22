import React from 'react';
import PropTypes from 'prop-types';

import ActionButton from './action_button'

const {formatText, messageHtmlToComponent} = window.PostUtils;

export default class PostType extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,

        actions: PropTypes.shape({
            doPostAction: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        options: {
            atMentions: true,
        }
    }

    getActionView = (attachment) => {
        const actions = attachment.actions;
        if (!actions || !actions.length) {
            return '';
        }
        const answers = this.props.post.props.answers || {};
        console.log("answers",answers);

        const content = [];

        actions.forEach((action) => {
            if (!action.id || !action.name) {
                return;
            }
            const voters =  answers[action.name] || [];
            console.log("voters", voters);    

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
    };


    getFieldsTable = (attachment) => {
        const fields = attachment.fields;
        if (!fields || !fields.length) {
            return '';
        }

        const fieldTables = [];

        let headerCols = [];
        let bodyCols = [];
        let rowPos = 0;
        let lastWasLong = false;
        let nrTables = 0;

        fields.forEach((field, i) => {
            if (rowPos === 2 || !(field.short === true) || lastWasLong) {
                fieldTables.push(
                    <table
                        className='attachment-fields'
                        key={'attachment__table__' + nrTables}
                    >
                        <thead>
                            <tr>
                                {headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {bodyCols}
                            </tr>
                        </tbody>
                    </table>
                );
                headerCols = [];
                bodyCols = [];
                rowPos = 0;
                nrTables += 1;
                lastWasLong = false;
            }
            headerCols.push(
                <th
                    className='attachment-field__caption'
                    key={'attachment__field-caption-' + i + '__' + nrTables}
                    width='50%'
                >
                    {field.title}
                </th>
            );

            const fieldValue = messageHtmlToComponent(formatText(field.value, this.props.options));
            bodyCols.push(
                <td
                    className='attachment-field'
                    key={'attachment__field-' + i + '__' + nrTables}
                >
                    {fieldValue}
                </td>
            );
            rowPos += 1;
            lastWasLong = !(field.short === true);
        });
        if (headerCols.length > 0) { // Flush last fields
            fieldTables.push(
                <table
                    className='attachment-fields'
                    key={'attachment__table__' + nrTables}
                >
                    <thead>
                        <tr>
                            {headerCols}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {bodyCols}
                        </tr>
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                {fieldTables}
            </div>
        );
    };

    isUrlSafe = (url) => {
        let unescaped;
    
        try {
            unescaped = decodeURIComponent(url);
        } catch (e) {
            unescaped = unescape(url);
        }
    
        unescaped = unescaped.replace(/[^\w:]/g, '').toLowerCase();
    
        return !unescaped.startsWith('javascript:') && // eslint-disable-line no-script-url
            !unescaped.startsWith('vbscript:') &&
            !unescaped.startsWith('data:');
    }

    render() {
        const {post} = this.props;
        const attachment = post.props.attachments[0] || {};
        let preTextClass = '';

        let preText;
        if (attachment.pretext) {
            preTextClass = 'attachment--pretext';
            const formattedPreText = messageHtmlToComponent(formatText(attachment.pretext. this.props.options));
            preText = (
                <div className='attachment__thumb-pretext'>
                    {formattedPreText}
                </div>
            );
        }

        let author = [];
        if (attachment.author_name || attachment.author_icon) {
            if (attachment.author_icon) {
                author.push(
                    <img
                        className='attachment__author-icon'
                        src={attachment.author_icon}
                        key={'attachment__author-icon'}
                        height='14'
                        width='14'
                    />
                );
            }
            if (attachment.author_name) {
                author.push(
                    <span
                        className='attachment__author-name'
                        key={'attachment__author-name'}
                    >
                        {attachment.author_name}
                    </span>
                );
            }
        }
        if (attachment.author_link && isUrlSafe(attachment.author_link)) {
            author = (
                <a
                    href={attachment.author_link}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {author}
                </a>
            );
        }

        let title;
        if (attachment.title) {
            if (attachment.title_link && isUrlSafe(attachment.title_link)) {
                title = (
                    <h1 className='attachment__title'>
                        <a
                            className='attachment__title-link'
                            href={attachment.title_link}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {attachment.title}
                        </a>
                    </h1>
                );
            } else {
                title = (
                    <h1 className='attachment__title'>
                        {attachment.title}
                    </h1>
                );
            }
        }

        let attachmentText;
        if (attachment.text) {
            attachmentText = messageHtmlToComponent(formatText(attachment.text));
        }

        let image;
        if (attachment.image_url) {
            image = (
                <img
                    className='attachment__image'
                    src={attachment.image_url}
                />
            );
        }

        let thumb;
        if (attachment.thumb_url) {
            thumb = (
                <div
                    className='attachment__thumb-container'
                >
                    <img
                        src={attachment.thumb_url}
                    />
                </div>
            );
        }

        const fields = this.getFieldsTable(attachment);
        const actions = this.getActionView(attachment);

        let useBorderStyle;
        if (attachment.color && attachment.color[0] === '#') {
            useBorderStyle = {borderLeftColor: attachment.color};
        }

        return (
            <div
                className={'attachment ' + preTextClass}
                ref='attachment'
            >
                {preText}
                <div className='attachment__content'>
                    <div
                        className={useBorderStyle ? 'clearfix attachment__container' : 'clearfix attachment__container attachment__container--' + attachment.color}
                        style={useBorderStyle}
                    >
                        {author}
                        {title}
                        <div>
                            <div
                                className={thumb ? 'attachment__body' : 'attachment__body attachment__body--no_thumb'}
                                // onClick={handleFormattedTextClick}
                            >
                                {attachmentText}
                                {image}
                                {fields}
                                {actions}
                            </div>
                            {thumb}
                            <div style={style.footer}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const style = {
    footer: {clear: 'both'},
};
