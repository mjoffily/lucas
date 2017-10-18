port module StylePort exposing (..)

import Css.File exposing (CssCompilerProgram, CssFileStructure)
import AppStyles as AppStyles
import AppStylesMobile as AppStylesMobile


port files : CssFileStructure -> Cmd msg


fileStructure : CssFileStructure
fileStructure =
    Css.File.toFileStructure
        [ ( "desktop.css", Css.File.compile [ AppStyles.css ] ), ( "mobile.css", Css.File.compile [ AppStylesMobile.css ] ) ]



main : CssCompilerProgram
main =
    Css.File.compiler files fileStructure
