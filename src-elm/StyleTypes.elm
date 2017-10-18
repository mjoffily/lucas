module StyleTypes exposing (..)

import Html.CssHelpers exposing (withNamespace)


cssNameSpace =
    withNamespace "remmit"
    
type CssClasses
    = TopResult
    | Result
    | Header
    | BottomResult
    | Error
    | CoinPrice
    | ButtonDiv
    | FormLine
    | Button
    | Footer
    | Right
    | Rowgrid
    | Row
    | CRol
    | Col1
    | Col2
    | Col3
    | Col4
    | Col5
    | Col6
    | Col7
    | Col8
    | Col9
    | Col10
    | Col11
    | Col12


type CssIds
    = SourceCountry
    | TargetCountry
    | Ads
    | ResultStyle

