/**
 * @author       Benjamin D. Richards <benjamindrichards@gmail.com>
 * @copyright    2013-2026 Phaser Studio Inc.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../../../utils/Class');
var BaseFilterShader = require('./BaseFilterShader');

var ShaderSourceFS = require('../../shaders/FilterGradientMap-frag.js');
var RampGlsl = require('../../shaders/Ramp-glsl.js');

/**
 * @classdesc
 * This RenderNode renders the GradientMap filter effect.
 * See {@link Phaser.Filters.GradientMap}.
 *
 * @class FilterGradientMap
 * @extends Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader
 * @memberof Phaser.Renderer.WebGL.RenderNodes
 * @constructor
 * @since 4.0.0
 * @param {Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager} manager - The manager that owns this RenderNode.
 */
var FilterGradientMap = new Class({
    Extends: BaseFilterShader,

    initialize: function FilterGradientMap (manager)
    {
        var additions = [
            {
                name: 'RAMP_0',
                tags: 'RAMP',
                additions: {
                    fragmentHeader: RampGlsl
                }
            }
        ];

        BaseFilterShader.call(this, 'FilterGradientMap', manager, null, ShaderSourceFS, additions);
    },

    setupTextures: function (controller, textures, _drawingContext)
    {
        // Ramp data texture.
        textures[1] = controller.ramp.glTexture;
    },

    setupUniforms: function (controller, _drawingContext)
    {
        var programManager = this.programManager;

        var ramp = controller.ramp;

        programManager.setUniform('uRampTexture', 1);
        programManager.setUniform('uRampResolution', ramp.dataTextureResolution);
        programManager.setUniform('uRampBandStart', ramp.dataTextureFirstBand);
        programManager.setUniform('uDither', controller.dither);
        programManager.setUniform('uUnpremultiply', controller.unpremultiply);
        programManager.setUniform('uColor', controller.color);
        programManager.setUniform('uColorFactor', controller.colorFactor);
        programManager.setUniform('uAlpha', controller.alpha);
    },

    updateShaderConfig: function (controller, _drawingContext)
    {
        var depth = controller.ramp.bandTreeDepth;

        var rampAddition = this.programManager.getAdditionsByTag('RAMP')[0];
        rampAddition.name = 'RAMP_' + depth;
        rampAddition.additions.fragmentHeader = RampGlsl.replace(
            '#define BAND_TREE_DEPTH 0.0',
            '#define BAND_TREE_DEPTH ' + depth + '.0'
        );
    }
});

module.exports = FilterGradientMap;
