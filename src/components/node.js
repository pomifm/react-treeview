'use strict';

import React from 'react';
import {VelocityTransitionGroup} from 'velocity-react';

import NodeHeader from './header';

class TreeNode extends React.Component {
    constructor(props){
        super(props);
        this.onEvent = this.onEvent.bind(this);
        this._eventBubbles = this.props._eventBubbles;
    }
    onEvent(type = 'toggled'){
        const {updateMe, state, options} = this._eventBubbles;
        const node = this.props.node;
        const eventParams = {node, updateMe, state, options};
        switch(type) {
            case 'toggled': {
                this._eventBubbles.onToggle(eventParams);
                break;
            }
            case 'active': {
                this._eventBubbles.onActive(eventParams);
                break;
            }
            case 'select': {
                this._eventBubbles.onSelected(eventParams);
                break;
            }
            case 'firstChild': {
                this._eventBubbles.onFirstChildSelected(eventParams);
                break;
            }
            default:
            break;
        }
    }
    animations(){
        const props = this.props;
        if(props.animations === false){ return false; }
        let anim = Object.assign({}, props.animations, props.node.animations);
        return {
            toggle: anim.toggle(this.props),
            drawer: anim.drawer(this.props),
            searchItem: anim.searchItem(this.props)
        };
    }
    decorators(){
        const props = this.props;
        let nodeDecorators = props.node.decorators || {};
        return Object.assign({}, props.decorators, nodeDecorators);
    }
    render(){
        const decorators = this.decorators();
        const animations = this.animations();
        if (this.props.node.__treeView_visibled) {
            return (
            <VelocityTransitionGroup {...animations.searchItem}>
                {
                    !this.props.state.__treeView_onSearching &&
                    <li className="treeview-node list-group-item" ref="topLevel">
                        { this.renderHeader(decorators, animations) }
                        { this.renderDrawer(decorators, animations) }
                    </li>
                }
            </VelocityTransitionGroup>
            );
        }
        return (
            this.renderDrawer(decorators, animations)
        );
    }
    renderDrawer(decorators, animations){
        const toggled = this.props.node.__treeView_toggled;
        if(!animations && !toggled){ return null; }
        if(!animations && toggled){
            return this.renderChildren(decorators, animations);
        }
        return (
            <VelocityTransitionGroup {...animations.drawer} ref="velocity">
                {toggled ? this.renderChildren(decorators, animations) : null}
            </VelocityTransitionGroup>
        );
    }
    renderHeader(decorators, animations){
        return (
            <NodeHeader
                decorators={decorators}
                animations={animations}
                node={Object.assign({}, this.props.node)}
                onEvent={this.onEvent}
                use={this._eventBubbles.use}
                options={this._eventBubbles.options}
            />
        );
    }
    renderChildren(decorators){
        if(this.props.node.loading && this.props.node.__treeView_visibled){ return this.renderLoading(decorators); }
        let children = this.props.node[this._eventBubbles.options.nodeName];
        if (!Array.isArray(children)) { children = children ? [children] : []; }
        return (
            <ul className="treeview-node list-group" ref="subtree">
                {children.map((child, index) =>
                    <TreeNode
                        key={child.id || index}
                        node={child}
                        _eventBubbles={this._eventBubbles}
                        {...this._eventBubbles}
                    />
                )}
            </ul>
        );
    }
    renderLoading(decorators){
        return (
            <ul className="treeview-node list-group">
                <li className="treeview-node-item list-group-item">
                    <decorators.Loading/>
                </li>
            </ul>
        );
    }
}

TreeNode.propTypes = {
    node: React.PropTypes.object.isRequired,
    state: React.PropTypes.oneOfType([
        React.PropTypes.object,
        React.PropTypes.array
    ]).isRequired,
    _eventBubbles: React.PropTypes.object.isRequired
};

export default TreeNode;
