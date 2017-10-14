port module StylePort exposing (..)

import Css.File exposing (CssCompilerProgram, CssFileStructure)
import AppStyles as AppStyles


port files : CssFileStructure -> Cmd msg


fileStructure : CssFileStructure
fileStructure =
    Css.File.toFileStructure
        [ ( "homepage.css", Css.File.compile [ AppStyles.css ] ) ]



main : CssCompilerProgram
main =
    Css.File.compiler files fileStructure
