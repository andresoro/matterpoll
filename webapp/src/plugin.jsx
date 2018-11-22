import Manifest from './manifest';

import PostType from './components/post_type';

export default class MatterPollPlugin {
    initialize(registry, store) {
        registry.registerPostTypeComponent('custom_matterpoll', PostType);
    }

    uninitialize() {
        //eslint-disable-next-line no-console
        console.log(Manifest.PluginId + '::uninitialize()');
    }
}
