import Manifest from './manifest';

import PostType from './components/post_type';
import reducer from './reducer'

export default class MatterPollPlugin {
    initialize(registry) {
        registry.registerPostTypeComponent('custom_matterpoll', PostType);
        registry.registerReducer(reducer);
    }

    uninitialize() {
        //eslint-disable-next-line no-console
        console.log(Manifest.PluginId + '::uninitialize()');
    }
}
