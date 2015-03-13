/**
 * Copyright (C) 2015 Doug Sheffer <desheffer@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global WPM */
(function($) {
    'use strict';

    // Game
    var game = new WPM.Game();

    // Input
    // @TODO: var keyboardMapper = new WPM.KeyboardMapper();
    var keyboardMapper = new WPM.KeyboardMapper();
    // @TODO: var input = new WPM.Input($(document), keyboardMapper);
    new WPM.Input($(document), game, $('#map-qwerty-to-dvorak'), keyboardMapper);

    // View
    // @TODO: var paraBox = new WPM.ParaBox($('#para-box'), WPM.paragraphs);
    new WPM.ParaBox(WPM.paragraphs, $('#paragraphs'), game);
    var typeBox = new WPM.TypeBox($('#type'), $('#stats')); // @TODO: Split to statsBox
    // @TODO: var statsBox = new WPM.StatsBox($('#stats-box'));
    var layoutBox = new WPM.LayoutBox($('#qwerty-layout'), $('#dvorak-layout')); // @TODO: Consolidate to one selector

    // $(input).on('letterpress', game.letterPressed);
    // $(input).on('backspacepress', game.backspacePressed);
    // $(layoutBox).on('layoutchange', keyboardMapper.layoutChanged);

    $(game).on('modechange.wpm', typeBox.modeChanged);
    $(game).on('countdown.wpm', typeBox.countdown);
    $(game).on('textchange.wpm', typeBox.textChanged);
    $(game).on('scorechange.wpm', typeBox.scoreChanged);
    $(game).on('textchange.wpm', layoutBox.render);

    $(game).on('modechange.wpm', function(e) { console.log(e); });
    $(game).on('countdown.wpm', function(e) { console.log(e); });
    $(game).on('textchange.wpm', function(e) { console.log(e); });
    $(game).on('scorechange.wpm', function(e) { console.log(e); });

    game.init();
})($);
