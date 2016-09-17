/**
 * Created by max on 17/09/16.
 */

function ScreenItemBuilder() {
    return this.constructor.call(this);
}

(function () {
    "use strict";
    if (ScreenItemBuilder.isDefined === true)
    {
        console.warn('ScreenItemBuilder', 'already defined')
    }
    ScreenItemBuilder.isDefined = true;
    var $ps = window.PubSub ? new PubSub() : null;
    var $ = window.$ || null;
    var COUNT = 0;

    ScreenItemBuilder.prototype.setUpPubSub = function (aPubSub) {

        if ($ps === null && aPubSub)
        {
            $ps = aPubSub;
        }
        if ($ps && $ps instanceof PubSub) {
            var $this = this;
            $ps.sub(ScreenItemBuilder.MSG_BUILD_ITEM, function (aScreenItemData) {
                $this.build(aScreenItemData);
            });
        }
        else {
            console.error('Could not set up PubSub for ', ScreenItemBuilder);
        }

    };

    ScreenItemBuilder.MSG_BUILD_ITEM = 'MSG_BUILD_ITEM';

    ScreenItemBuilder.prototype.constructor = function (aParent) {

        this.defaultParent = aParent || 'body';
        this.setUpPubSub();
    };

    ScreenItemBuilder.prototype.items = {};

    function makeItemData(aData) {
        var screenItemData = {};
        screenItemData.id = aData.id || '#screen-item-'+COUNT;
        screenItemData.type = aData.type || 'div';
        screenItemData.subItems = [];
        if (aData.class)
        {
            aData.classList = aData.class instanceof Array ? aData.class : aData.class.split(' ');
        }
        else
        {
            aData.classList = [];
        }
        screenItemData.attr = aData.attr || {};
        screenItemData.data = aData.data || {};
        screenItemData.html = aData.html || '';
       screenItemData.parent = aData.parent || this.defaultParent;
        if (aData.subItems)
        {
            for (var i in aData.subItems)
            {
                screenItemData.subItems.push(makeItemData.call(this,aData.subItems[i]));
            }
        }
        return screenItemData
    }

    function construct(aScreenItemData) {
        if ($ps) $ps.log('constructing...',aScreenItemData);

        var item = $(document.createElement(aScreenItemData.type))
            .attr('id',aScreenItemData.id)
            .html(aScreenItemData.html);

        for (var name in Object.keys(aScreenItemData.attr))
        {
            item.attr(name,aScreenItemData.attr[name]);
        }

        for (var name in Object.keys(aScreenItemData.data))
        {
            item.data(name,aScreenItemData.data[name]);
        }

        for (var i in aScreenItemData.subItems)
        {
            item.append(construct(aScreenItemData.subItems[i]))
        }

        return item;

    }

    ScreenItemBuilder.prototype.build = function (aData) {
        if ($ps) $ps.log('attempting to build from data',aData);
        COUNT++;
        var screenItemData = makeItemData.call(this,aData);
        var item = this.items[screenItemData.id] = construct(screenItemData);
        $(document).ready(function () {
            if (screenItemData.parent instanceof jQuery) {
                screenItemData.parent.append(item);
            }
            else {
                $(screenItemData.parent).append(item);
            }
        });
    };
})();

define(['jquery', 'service/pub-sub'],function ($, PubSub) {
    return ScreenItemBuilder;
});