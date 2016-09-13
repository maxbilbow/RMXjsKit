/**
 * Created by max on 09/09/16.
 */

function TestKit() {
    return this.constructor.call(this,arguments);
}

(function() {
    "use strict";

    TestKit.prototype.constructor = function() {
        this._tests = {};
        this._count = 0;
        this._success = 0;
        this._failure = 0;
    };

    TestKit.prototype.tests = null;

    TestKit.prototype.fail = function(aMessage)
    {
      console.assert(false,aMessage||'Test Failed');
          // {name: 'AssertionError',
          // actual: 1,
          // expected: 2,
          // operator: '===',
          // message: 'Test Failed',
          // generatedMessage: true });//,aMessage||'Test Failed');
    };

    TestKit.prototype.assertTrue = function (a, aMessage) {
        console.assert(a,aMessage || a + ' === ' + true);
        // if (a !== true) {
        //     this.fail(aMessage || a + ' !== ' + true);
        // }
    };


    TestKit.prototype.assertFalse = function (a, aMessage) {
        console.assert(a === false, aMessage || a + ' === ' + false);
    };

    TestKit.prototype.assertEquals = function (a, b, aMessage) {
        this.assertTrue(a === b, a + ' !== ' + b + ' ' + (aMessage || ''));
    };

    TestKit.prototype.assertNotEquals = function (a, b, aMessage) {
        this.assertFalse(a === b, a + ' === ' + b + ' ' + (aMessage || ''));
    };


    TestKit.prototype.assertEquivalent = function (a, b, aMessage) {
        this.assertTrue(a == b, a + ' != ' + b + ' ' + (aMessage || ''));
    };

    TestKit.prototype.assertNotEquivalent = function (a, b, aMessage) {
        this.assertFalse(a == b, a + ' == ' + b + ' ' + (aMessage || ''));
    };

    TestKit.prototype.setup = function (aFn) {
        if (aFn)
        {
            this._setup = aFn;
        }
        else if (this._setup)
        {
            this._setup.call(this);
        }
        return this;
    };

    TestKit.prototype.teardown = function (aFn) {
        if (aFn)
        {
            this._teardown = aFn;
        }
        else if (this._teardown)
        {
            this._teardown.call(this);
        }
        return this;
    };

    TestKit.prototype.before = function (aFn) {
        if (aFn)
        {
            this._before = aFn;
        }
        else if (this._before)
        {
            this._before.call(this);
        }
        return this;
    };

    TestKit.prototype.after = function (aFn) {
        if (aFn)
        {
            this._after = aFn;
        }
        else if (this._after)
        {
            this._after.call(this);
        }
        return this;
    };

    TestKit.prototype.addTest = function (aName, aTest) {
        var testName;
        if (aTest === undefined) {
            aTest = aName;
            testName = 'Test' + this._count++;
        }
        else {
            testName = 'Test' + this._count++ + '_' + aName;
        }
        this._tests[testName] = aTest;
        return this;
    };

    TestKit.prototype.run = function () {
        try {
            var tests = this._tests;
            var $this = this;
            this.setup();
            Object.keys(tests).forEach(function (aName) {
                try {
                    $this.before();
                    tests[aName].call($this);
                    $this.after();
                    console.info(aName, 'PASSED');
                    $this._success++;
                }
                catch (e) {
                    // if (e instanceof assert.AssertionError)
                    // {
                        console.error(aName, 'FAILED', e);
                    $this._failure++;
                    // }//.trace();
                    // else {
                    //     throw e;
                    // }
                }
            });
            this.teardown();
        } catch (e) {
            console.error('TEST FAILED DUE TO ERROR',e);
        }
        finally {
            var total = Object.keys(this._tests).length;
            var result;
            if (total === this._count)
            {
                result = 'TESTS COMPLETE'
            }
            else
            {
                result = 'ONLY ' + this._count +'/' + total + ' TESTS COMPLETE';
            }
            if (this._failure > 0)
            {
                result += ' WITH '+this._failure+' ERROR(S).';
            }
            console.log('>>> '+result);
            console.log('>>> SUCCESS: ' + this._success);
            console.log('>>> FAILURE: ' + this._failure);
        }
    };

})();

var test = new TestKit();
test.setup(function () {
    this.persistent = true;
}).teardown(function () {
    this.persistent = null;
});

test.before(function () {
    this.temp=1;
}).after(function () {
    this.temp=null;
});

test.addTest('first', function () {
    this.assertEquals(1, 1);
    this.assertNotEquals(1, '1');
    this.assertEquivalent(1, '1');
    this.assertNotEquivalent(1, '2');

    this.assertEquivalent(null, undefined);
    this.assertNotEquals(null, undefined);

    this.assertEquivalent(false, 0);
    this.assertNotEquals(false, 0);

    this.assertEquivalent(0, []);
    this.assertNotEquals(0, []);

    this.assertEquivalent(false, []);
    this.assertNotEquals(false, []);
}).addTest(function () {
    this.assertTrue(true);
    this.assertFalse(false);
    try {
        this.assertFalse('false');
        this.fail("assertFalse('true'|'false') should both fail as they are of type 'string'");
    } catch (e){}
    try {
        this.assertTrue('true');
        this.fail("assertFalse('true'|'false') should both fail as they are of type 'string'");
    } catch (e){}
    try {
        this.assertFalse(true);
        this.fail("assertFalse(true)");
    } catch (e){}
    try {
        this.assertTrue(false);
        this.fail("assertTrue(false)");
    } catch (e){}
}).addTest(function () {
    try {
        this.fail('FAIL');
    } catch (e)
    {
        if (e.message !== 'FAIL')
        {
            this.fail(e);
        }
    }
}).addTest(function () {
    // console.assert(1===2);
    this.assertTrue(this.persistent);
    this.persistent = false;
    this.assertEquals(this.temp,1);
    this.temp = 2;
}).addTest(function () {
    this.assertFalse(this.persistent);
    this.assertEquals(this.temp,1);

}).run();

// console.assert(1===2);
