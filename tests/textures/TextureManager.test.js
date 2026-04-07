vi.mock('../../src/gameobjects/image/Image', function ()
{
    return function Image () {};
});

vi.mock('../../src/gameobjects/tilesprite/TileSprite', function ()
{
    return function TileSprite () {};
});

vi.mock('../../src/display/canvas/CanvasPool', function ()
{
    var mockCtx = {
        clearRect: function () {},
        drawImage: function () {},
        getImageData: function () { return { data: [ 0, 0, 0, 0 ] }; }
    };

    var mockCanvas = {
        getContext: function () { return mockCtx; },
        width: 256,
        height: 256,
        toDataURL: function () { return ''; }
    };

    return {
        create2D: function () { return mockCanvas; },
        create: function () { return mockCanvas; },
        remove: function () {}
    };
});

var TextureManager = require('../../src/textures/TextureManager');

function createMockGame ()
{
    return {
        events: {
            once: function () {},
            emit: function () {}
        },
        config: {
            defaultImage: null,
            missingImage: null,
            whiteImage: null
        },
        renderer: null
    };
}

function createMockTexture (key)
{
    return {
        key: key,
        source: [ { width: 100, height: 100 } ],
        frames: {},
        destroy: function () {},
        get: function (frame)
        {
            return this.frames[frame] || this.frames['__BASE'] || null;
        }
    };
}

describe('Phaser.Textures.TextureManager', function ()
{
    var tm;

    beforeEach(function ()
    {
        tm = new TextureManager(createMockGame());
    });

    describe('constructor', function ()
    {
        it('should set name to TextureManager', function ()
        {
            expect(tm.name).toBe('TextureManager');
        });

        it('should initialize list as an empty object', function ()
        {
            expect(tm.list).toEqual({});
        });

        it('should set silentWarnings to false by default', function ()
        {
            expect(tm.silentWarnings).toBe(false);
        });

        it('should store a reference to the game', function ()
        {
            var game = createMockGame();
            var manager = new TextureManager(game);
            expect(manager.game).toBe(game);
        });

        it('should create a stampCrop Rectangle with numeric x and y', function ()
        {
            expect(tm.stampCrop).toBeDefined();
            expect(typeof tm.stampCrop.x).toBe('number');
            expect(typeof tm.stampCrop.y).toBe('number');
        });
    });

    describe('checkKey', function ()
    {
        it('should return true for a new unique string key', function ()
        {
            expect(tm.checkKey('newKey')).toBe(true);
        });

        it('should return false for a key already in use', function ()
        {
            tm.silentWarnings = true;
            tm.list['existingKey'] = {};
            expect(tm.checkKey('existingKey')).toBe(false);
        });

        it('should return false for an empty string', function ()
        {
            tm.silentWarnings = true;
            expect(tm.checkKey('')).toBe(false);
        });

        it('should return false for null', function ()
        {
            tm.silentWarnings = true;
            expect(tm.checkKey(null)).toBe(false);
        });

        it('should return false for a non-string value', function ()
        {
            tm.silentWarnings = true;
            expect(tm.checkKey(42)).toBe(false);
        });
    });

    describe('exists', function ()
    {
        it('should return false when the key is not in the list', function ()
        {
            expect(tm.exists('nonExistent')).toBe(false);
        });

        it('should return true when the key is in the list', function ()
        {
            tm.list['myTexture'] = {};
            expect(tm.exists('myTexture')).toBe(true);
        });

        it('should not match keys inherited from the object prototype', function ()
        {
            expect(tm.exists('constructor')).toBe(false);
            expect(tm.exists('hasOwnProperty')).toBe(false);
        });
    });

    describe('get', function ()
    {
        it('should return the texture when the key is found', function ()
        {
            var tex = createMockTexture('player');
            tm.list['player'] = tex;
            expect(tm.get('player')).toBe(tex);
        });

        it('should return the __DEFAULT texture when key is undefined', function ()
        {
            var def = createMockTexture('__DEFAULT');
            tm.list['__DEFAULT'] = def;
            expect(tm.get(undefined)).toBe(def);
        });

        it('should return the __MISSING texture when the key is not found', function ()
        {
            var missing = createMockTexture('__MISSING');
            tm.list['__MISSING'] = missing;
            expect(tm.get('nonExistent')).toBe(missing);
        });
    });

    describe('removeKey', function ()
    {
        it('should remove an existing key from the list', function ()
        {
            tm.list['toRemove'] = {};
            tm.removeKey('toRemove');
            expect(tm.exists('toRemove')).toBe(false);
        });

        it('should return the TextureManager for chaining', function ()
        {
            var result = tm.removeKey('nonExistent');
            expect(result).toBe(tm);
        });

        it('should not throw when the key does not exist', function ()
        {
            expect(function () { tm.removeKey('missing'); }).not.toThrow();
        });
    });

    describe('remove', function ()
    {
        it('should call destroy on the texture when removing by key', function ()
        {
            var destroyed = false;
            var tex = createMockTexture('player');
            tex.destroy = function () { destroyed = true; };
            tm.list['player'] = tex;

            tm.remove('player');

            expect(destroyed).toBe(true);
        });

        it('should emit the removetexture event with the key', function ()
        {
            var emittedKey = null;
            var tex = createMockTexture('player');
            tm.list['player'] = tex;
            tm.on('removetexture', function (key) { emittedKey = key; });

            tm.remove('player');

            expect(emittedKey).toBe('player');
        });

        it('should return the TextureManager for chaining when key is missing', function ()
        {
            tm.silentWarnings = true;
            var result = tm.remove('nonExistent');
            expect(result).toBe(tm);
        });

        it('should return the TextureManager for chaining after successful removal', function ()
        {
            var tex = createMockTexture('player');
            tm.list['player'] = tex;
            var result = tm.remove('player');
            expect(result).toBe(tm);
        });
    });

    describe('getTextureKeys', function ()
    {
        it('should return an empty array when no user textures are loaded', function ()
        {
            expect(tm.getTextureKeys()).toEqual([]);
        });

        it('should exclude __DEFAULT, __MISSING, __WHITE, and __NORMAL', function ()
        {
            tm.list['__DEFAULT'] = {};
            tm.list['__MISSING'] = {};
            tm.list['__WHITE'] = {};
            tm.list['__NORMAL'] = {};
            expect(tm.getTextureKeys()).toEqual([]);
        });

        it('should return user-defined texture keys', function ()
        {
            tm.list['player'] = {};
            tm.list['enemy'] = {};
            var keys = tm.getTextureKeys();
            expect(keys).toContain('player');
            expect(keys).toContain('enemy');
            expect(keys.length).toBe(2);
        });

        it('should include user keys while excluding built-in keys', function ()
        {
            tm.list['__DEFAULT'] = {};
            tm.list['hero'] = {};
            var keys = tm.getTextureKeys();
            expect(keys).toEqual([ 'hero' ]);
        });
    });

    describe('renameTexture', function ()
    {
        it('should move the texture to the new key and remove the old key', function ()
        {
            var tex = createMockTexture('oldName');
            tm.list['oldName'] = tex;

            var result = tm.renameTexture('oldName', 'newName');

            expect(result).toBe(true);
            expect(tm.exists('newName')).toBe(true);
            expect(tm.exists('oldName')).toBe(false);
        });

        it('should update the texture key property to the new name', function ()
        {
            var tex = createMockTexture('oldName');
            tm.list['oldName'] = tex;

            tm.renameTexture('oldName', 'newName');

            expect(tex.key).toBe('newName');
        });

        it('should return false when the current key does not exist', function ()
        {
            var result = tm.renameTexture('nonExistent', 'newName');
            expect(result).toBe(false);
        });

        it('should return false when current and new keys are the same', function ()
        {
            var tex = createMockTexture('same');
            tm.list['same'] = tex;

            var result = tm.renameTexture('same', 'same');
            expect(result).toBe(false);
        });
    });

    describe('setTexture', function ()
    {
        it('should assign texture and frame on the game object', function ()
        {
            var mockFrame = { name: '__BASE' };
            var mockTexture = {
                key: 'player',
                get: function () { return mockFrame; }
            };
            tm.list['player'] = mockTexture;

            var gameObject = { texture: null, frame: null };
            tm.setTexture(gameObject, 'player', '__BASE');

            expect(gameObject.texture).toBe(mockTexture);
            expect(gameObject.frame).toBe(mockFrame);
        });

        it('should not modify the game object when the key is not found', function ()
        {
            var gameObject = { texture: 'original', frame: 'origFrame' };
            tm.setTexture(gameObject, 'nonExistent');

            expect(gameObject.texture).toBe('original');
            expect(gameObject.frame).toBe('origFrame');
        });

        it('should return the game object', function ()
        {
            var gameObject = { texture: null, frame: null };
            var result = tm.setTexture(gameObject, 'nonExistent');
            expect(result).toBe(gameObject);
        });
    });

    describe('each', function ()
    {
        it('should call the callback once per texture in the list', function ()
        {
            tm.list['tex1'] = createMockTexture('tex1');
            tm.list['tex2'] = createMockTexture('tex2');

            var called = [];
            tm.each(function (texture) { called.push(texture.key); }, null);

            expect(called).toContain('tex1');
            expect(called).toContain('tex2');
            expect(called.length).toBe(2);
        });

        it('should forward additional arguments to the callback', function ()
        {
            tm.list['tex1'] = createMockTexture('tex1');

            var received;
            tm.each(function (texture, _scope, a, b) { received = [ a, b ]; }, null, 'hello', 99);

            expect(received).toEqual([ 'hello', 99 ]);
        });

        it('should use the provided scope when calling the callback', function ()
        {
            tm.list['tex1'] = createMockTexture('tex1');

            var scope = { id: 'myScope' };
            var capturedThis;
            tm.each(function () { capturedThis = this; }, scope);

            expect(capturedThis).toBe(scope);
        });
    });

    describe('getFrame', function ()
    {
        it('should return undefined when the texture key does not exist', function ()
        {
            expect(tm.getFrame('nonExistent')).toBeUndefined();
        });

        it('should return the result of calling get() on the texture', function ()
        {
            var mockFrame = { name: '__BASE' };
            var mockTexture = { get: function () { return mockFrame; } };
            tm.list['player'] = mockTexture;

            expect(tm.getFrame('player')).toBe(mockFrame);
        });

        it('should pass the frame argument to the texture get call', function ()
        {
            var received;
            var mockTexture = { get: function (f) { received = f; return null; } };
            tm.list['atlas'] = mockTexture;

            tm.getFrame('atlas', 'run_01');
            expect(received).toBe('run_01');
        });
    });

    describe('parseFrame', function ()
    {
        it('should return undefined for null', function ()
        {
            expect(tm.parseFrame(null)).toBeUndefined();
        });

        it('should return undefined for an empty string', function ()
        {
            expect(tm.parseFrame('')).toBeUndefined();
        });

        it('should look up a frame by string key', function ()
        {
            var mockFrame = { name: '__BASE' };
            var mockTexture = { get: function () { return mockFrame; } };
            tm.list['player'] = mockTexture;

            expect(tm.parseFrame('player')).toBe(mockFrame);
        });

        it('should look up a frame from a [key, frame] array', function ()
        {
            var mockFrame = { name: 'run' };
            var mockTexture = {
                get: function (f) { return f === 'run' ? mockFrame : null; }
            };
            tm.list['player'] = mockTexture;

            expect(tm.parseFrame([ 'player', 'run' ])).toBe(mockFrame);
        });

        it('should look up a frame from a plain object with key and frame properties', function ()
        {
            var mockFrame = { name: 'idle' };
            var mockTexture = {
                get: function (f) { return f === 'idle' ? mockFrame : null; }
            };
            tm.list['player'] = mockTexture;

            expect(tm.parseFrame({ key: 'player', frame: 'idle' })).toBe(mockFrame);
        });
    });
});
