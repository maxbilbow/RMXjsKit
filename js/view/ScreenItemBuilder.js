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

    function ItemData(aData) {
        COUNT++;
        this.id = aData.id || '#screen-item-'+COUNT;
        this.type = aData.type || 'div';
        this.subItems = [];
        if (aData.class)
        {
            this.classList = aData.class instanceof Array ? aData.class : aData.class.split(' ');
        }
        else
        {
            this.classList = [];
        }
        this.attr = aData.attr || {};
        this.data = aData.data || {};
        this.html = aData.html || '';

        if (aData.subItems)
        {
            for (var i in aData.subItems)
            {
                this.subItems.push(new ItemData(aData.subItems[i]));
            }
        }

    }

    function construct(aScreenItemData) {
        if ($ps) $ps.log('constructing...',aScreenItemData.type,aScreenItemData.id);

        var item = $(document.createElement(aScreenItemData.type));

        item.attr('id',aScreenItemData.id);

        if (aScreenItemData.attr) {
            for (var name in aScreenItemData.attr) {
                item.attr(name, aScreenItemData.attr[name]);
            }
        }

        if (aScreenItemData.data) {
            for (var name in aScreenItemData.data) {
                item.data(name, aScreenItemData.data[name]);
            }
        }

        if (aScreenItemData.classList) {
            for (var i in aScreenItemData.classList) {
                item.addClass(aScreenItemData.classList[i]);
            }
        }

        if (aScreenItemData.html)
        {
            item.html(aScreenItemData.html);
        }

        if (aScreenItemData.subItems) {
            for (var i in aScreenItemData.subItems) {
                item.append(construct(aScreenItemData.subItems[i]))
            }
        }

        return item;

    }

    ScreenItemBuilder.prototype.build = function (aData) {
        if ($ps) $ps.log('attempting to build from data');
        var screenItemData = new ItemData(aData);
        var parent = aData.parent || this.defaultParent;
        this.items[screenItemData.id] = screenItemData;
        $(document).ready(function () {
            var item = construct(screenItemData);
            if (parent instanceof jQuery) {
                parent.append(item);
            }
            else {

                $(parent).append(item);
            }
        });
    };
})();

define(['jquery', 'service/pub-sub'],function ($, PubSub) {
    return ScreenItemBuilder;
});