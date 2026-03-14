/**
 * @author       Benjamin D. Richards <benjamindrichards@gmail.com>
 * @copyright    2013-2026 Phaser Studio Inc.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var DefineBlockyTexCoord = require('../DefineBlockyTexCoord-glsl');

/**
 * Returns a ShaderAdditionConfig for implementing smooth pixel art.
 * This uses the Standard Derivatives extension to WebGL
 * to render antialiased, uninterpolated texels.
 *
 * @function Phaser.Renderer.WebGL.ShaderAdditionMakers.MakeSmoothPixelArt
 * @since 4.0.0
 * @param {boolean} [disable=false] - Whether to disable the shader addition on creation.
 * @returns {Phaser.Types.Renderer.WebGL.ShaderAdditionConfig} The shader addition configuration.
 */
var MakeSmoothPixelArt = function (disable)
{
    return {
        name: 'SmoothPixelArt',
        additions: {
            extensions: '#extension GL_OES_standard_derivatives : enable',
            fragmentHeader: DefineBlockyTexCoord,
            texCoord: 'texCoord = getBlockyTexCoord(texCoord, getTexRes());'
        },
        disable: !!disable
    };
};

module.exports = MakeSmoothPixelArt;
