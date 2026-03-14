/**
 * @author       Benjamin D. Richards <benjamindrichards@gmail.com>
 * @copyright    2013-2026 Phaser Studio Inc.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var GetTexRes = require('../GetTexRes-glsl');

/**
 * Returns a ShaderAdditionConfig for extracting a resolution
 * from an array of resolutions, such as is used in multi-texture rendering.
 *
 * @function Phaser.Renderer.WebGL.ShaderAdditionMakers.MakeGetTexRes
 * @since 4.0.0
 * @param {boolean} [disable=false] - Whether to disable the shader addition on creation.
 * @returns {Phaser.Types.Renderer.WebGL.ShaderAdditionConfig} The shader addition configuration.
 */
var MakeGetTexRes = function (disable)
{
    return {
        name: 'GetTexRes',
        additions: {
            fragmentHeader: GetTexRes
        },
        tags: [ 'TEXRES' ],
        disable: !!disable
    };
};

module.exports = MakeGetTexRes;
