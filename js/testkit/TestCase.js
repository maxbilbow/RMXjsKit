/**
 * Created by max on 09/09/16.
 */

var TestKit = function () {
    this.tests = {};
    this.count = 0;
}

TestKit.prototype.tests = null;


TestKit.prototype.assertTrue = function (a,aMessage) {
    if (a !== true)
    {
        throw Error(aMessage || 'false');
    }
};


TestKit.prototype.assertFalse = function (a,aMessage) {
    if (a !== false)
    {
        throw Error(aMessage || 'true');
    }
};

TestKit.prototype.assertEquals = function (a,b,aMessage) {
    this.assertTrue(a === b, a+ ' !== ' + b + ' ' + (aMessage||''));
};

TestKit.prototype.assertNotEquals = function (a,b,aMessage) {
    this.assertFalse(a === b, a+ ' === ' + b + ' ' + (aMessage||''));
};


TestKit.prototype.assertEquivalent = function (a,b,aMessage) {
    this.assertTrue(a == b, a+ ' != ' + b + ' ' + (aMessage||''));
};

TestKit.prototype.assertNotEquivalent = function (a,b,aMessage) {
    this.assertFalse(a == b, a+ ' == ' + b + ' ' + (aMessage||''));
};


TestKit.prototype.addTest = function (aName,aTest) {
    if (aTest === undefined)
    {
        aTest = aName;
        aName = 'Test'+this.count++;
    }
    else
    {
        aName = 'Test'+this.count++ + '_' + aName;
    }
    var $this = this;
    this.tests[aName] = function () {
        aTest($this);
    };
    return this;
}

TestKit.prototype.run = function () {
    var tests = this.tests;
    Object.keys(tests).forEach(function (aName)
    {
        try {
           tests[aName]();
            console.info(aName,'PASSED');
        }
        catch (e)
        {
            console.error(aName,'FAILED',e);
        }

    });
}

var test = new TestKit();

test.addTest('first',function ($) {
    $.assertEquals(1,1);
    $.assertNotEquals(1,'1');
    $.assertEquivalent(1,'1');
    $.assertNotEquivalent(1,'2');

    $.assertEquivalent(null,undefined);
    $.assertNotEquals(null,undefined);

    $.assertEquivalent(false, 0);
    $.assertNotEquals(false,0);

    $.assertEquivalent(0, []);
    $.assertNotEquals(0,[]);

    $.assertEquivalent(false, []);
    $.assertNotEquals(false,[]);


}).run();