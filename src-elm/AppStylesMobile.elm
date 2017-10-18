module AppStylesMobile exposing (css)

import Css exposing (..)
import Css.Elements exposing (..)
import Css.Colors exposing (..)
import Css.Namespace exposing (namespace)
import Css.Media exposing (..)
import StyleTypes exposing (..)

css =
    (stylesheet << namespace cssNameSpace.name)
        [ Css.Media.media [ only screen [ Css.Media.maxWidth (px 768) ] ]
            [ Css.selector "html"
                [ Css.fontFamily sansSerif
                , Css.height (pct 100)
                ]
            , Css.class Header
                [ Css.textAlign center
                ]
            , Css.selector "h1"
                [ Css.fontSize (Css.em 1.5)
                ]
            , Css.selector "*"
                [Css.boxSizing borderBox]
            , Css.selector "[class*=Col]"
                [ Css.float left
                , Css.padding (px 15)
                ]
            , Css.class FormLine
                [ Css.marginBottom (Css.em 1)
                ]
            , Css.class Error
                [ Css.color Css.Colors.red
                ]
            , Css.class SourceCountry
                [ Css.float left
                , Css.backgroundColor (hex "#F0F0F0")
                , Css.width (pct 100)
                , Css.padding (px 20)
                --, Css.height (px 217)
                --, Css.marginTop (px 50)
                --, Css.margin (px 12)
                , Css.color (rgb 0 0 0)
                , Css.border3 (px 0.2) solid (hex "#DEB887")
                ]
            , Css.class TargetCountry
                [ Css.float left
                , Css.backgroundColor (hex "#F0F0F0")
                , Css.width (pct 100)
                , Css.padding (px 20)
                --, Css.height (px 217)
                , Css.marginTop (px 20)
                --, Css.margin (px 12)
                , Css.color (rgb 0 0 0)
                , Css.border3 (px 0.2) solid (hex "#DEB887")
                ]
            , Css.class ButtonDiv
                [ property "clear" "both"
                ]
            , Css.class Button
                [ Css.backgroundColor (hex "#4CAF50")
                , Css.border3 (px 0.2) solid Css.Colors.black
                , Css.color Css.Colors.white
                , Css.padding (px 10)
                , Css.textAlign center
                , Css.display  inlineBlock
                , Css.fontSize (px 12)
                , Css.width (pct 100)
                , Css.marginTop (px 15)
                , Css.marginBottom (px 15)
                , Css.cursor Css.pointer
                ]
            , Css.id Ads
                [ Css.padding (px 10)
                , Css.border3 (px 2) dashed Css.Colors.green
                , Css.height (pct 80)
                , Css.margin (pct 15)
                ]
            , Css.class Footer
                [ Css.backgroundColor (hex "#0099cc")
                , Css.color (hex "#ffffff")
                , Css.textAlign center
                , Css.fontSize  (px 12)
                , Css.padding (px 15)
                , property "clear" "both"
                ]
--            , Css.class Row
--                [ Css.height (vh 80)
--                -- , Css.after [content none, display Css.table]
--                ]
            , Css.class aside
                [ Css.padding (px 15)
                , Css.margin (px 15)
                , Css.height (pct 100)
                , Css.color (hex "#ffffff")
                , Css.textAlign center
                , Css.fontSize (px 14)
                ]
    --      /* For desktop: */
            , Css.Media.media [ only screen [  Css.Media.minWidth (px 0), Css.Media.maxWidth (px 480) ] ]       
                [ Css.class CoinPrice [ Css.display none ] ]
                
            , Css.class Col1 [ Css.width (pct 8.33) ]
                , Css.class Col2 [ Css.width (pct 16.33) ]
                , Css.class Col3 [ Css.width (pct 25)
                    , children [ 
                        Css.class Right 
                            [ Css.height (pct 100) ]
                        ]
                    ]
            
                , Css.class Col4 [ Css.width (pct 33.33) ]
                , Css.class Col5 [ Css.width (pct 41.66) ]
                , Css.class Col6 [ Css.width (pct 100) ]
                , Css.class Col7 [ Css.width (pct 58.33) ]
                , Css.class Col8 [ Css.width (pct 66.66) ]
                , Css.class Col9 [ Css.width (pct 75) ]
                , Css.class Col10 [ Css.width (pct 83.33) ]
                , Css.class Col11 [ Css.width (pct 91.66) ]
                , Css.class Col12 [ Css.width (pct 100) ]
                , Css.class BottomResult 
                    [ Css.border2 (px 1) solid
                    , Css.borderColor (hex "#DADAA9")
                    , Css.fontSize (Css.em 0.5)
                    , Css.backgroundColor (hex "#fff5ee")
                    , Css.padding (px 20)
                    ]
                , Css.class Rowgrid
                    [ Css.width (pct 100)
                    , Css.display Css.table
                    -- this was a pain in the neck to figure out. Add this when the element is not supported by elm-css
                    , (property "table-layout" "fixed")
                    , Css.padding (px 2)
                    ]
                , Css.class CRol [ Css.display Css.tableCell]
                , Css.class Result 
                    [ Css.backgroundColor (hex "#dadad2")
                    --, Css.margin (px 37)
                    , Css.display block
                    , Css.float left
                    , Css.border2 (px 1) solid
                    , Css.borderColor (hex "#DADAA9")
                    , Css.fontSize (Css.em 1)
                    , Css.padding (px 10)
                    ]
            ]

-- div .bottomResult {
--     border: solid;
--     border-color: #DADAA9;
--     font-size: 0.5em;
--     background-color: seashell;
--     padding: 20px;
-- }

-- @media (min-width: 30em) {
--     .rowgrid { width: 100%; display: table; table-layout: fixed; padding: 2px;}
--     .col { display: table-cell; }
-- }


--     .col-3.right {height: 100%;}
--     .col-4 {width: 33.33%;}
--     .col-5 {width: 41.66%;}
--     .col-6 {width: 50%;}
--     .col-7 {width: 58.33%;}
--     .col-8 {width: 66.66%;}
--     .col-9 {width: 75%;}
--     .col-10 {width: 83.33%;}
--     .col-11 {width: 91.66%;}
--     .col-12 {width: 100%;}
-- }
        ]
-- .row::after {
--     content: "";
--     clear: both;
--     display: table;
-- }


-- #core {
--     background-color: black;
-- }

-- #sourcecountry {
--     float: left;
--     background-color: green;
--     width: 50%;
--     padding: 20px;
--     height:217px;
--     margin-top: 50px;
-- }
-- #targetcountry {
--     background-color: yellow;
--     width: 48%;
--     float: left;
--     padding: 20px;
--     height: 217px;
--     margin-left: 10px;
--     margin-top: 50px;
-- } 

-- div#result {
--     margin: 37px;
--     background-color: #dadad2;
--     display: block;
--     float: left;
--     border: solid;
--     border-color: #DADAA9;
--     font-size: 1.5em;
--     padding: 10px;
-- }

-- div .topResult {
-- }

-- div .bottomResult {
--     border: solid;
--     border-color: #DADAA9;
--     font-size: 0.5em;
--     background-color: seashell;
--     padding: 20px;
-- }

-- @media (min-width: 30em) {
--     .rowgrid { width: 100%; display: table; table-layout: fixed; padding: 2px;}
--     .col { display: table-cell; }
-- }

-- header {
--     background-color: white;
--     color: black;
--     padding: 0px;
--     height: 8vh;
--     border: none;
-- }
-- .menu ul {
--     list-style-type: none;
--     margin: 0;
--     padding: 0;
-- }
-- .menu li {
--     padding: 8px;
--     margin-bottom: 7px;
--     background-color: #33b5e5;
--     color: #ffffff;
--     box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
-- }
-- .menu li:hover {
--     background-color: #0099cc;
-- }
-- .aside {
--     /*background-color: #33b5e5;*/
--     padding: 15px;
--     margin: 15px;
--     height: 100%;
--     color: #ffffff;
--     text-align: center;
--     font-size: 14px;
--     /*box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);*/
-- }




-- /* For mobile phones: */
-- [class*="col-"] {
--     width: 100%;
-- }
