module Main exposing (..)

import Html exposing (Html, div, text, button, input, select, option)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Json
import String
import Css exposing (..)
import Css.Elements exposing (..)
import Css.Namespace exposing (namespace)
import Html.CssHelpers exposing (withNamespace)
import Css.Colors exposing (..)
import StyleTypes exposing (..)
import AppStyles exposing (..)
import Json.Decode.Pipeline exposing (..)
import Json.Decode exposing (..)
import Http exposing (..)
import Debug

{ id, class, classList } =
    cssNameSpace
-- Model


type alias SupportedCountry =
    { country : String
    , currencySymbol : String
    , name: String
    , exchanges : List String
    }

type alias SupportedCountries = List SupportedCountry

emptyCountry : SupportedCountry
emptyCountry = 
    { country = ""
    , currencySymbol = ""
    , name = ""
    , exchanges = [ "" ]
    }

type alias ArbitrageResponse = 
    { spotRate : String
    , currencyPair : String
    , amountInSourceCurrency: String
    , amountInDestinationCurrencyUsingSpotRate: String
    , numberOfBitcoinsBoughtAtOrigin: String
    , amountInDestinationCurrencyAfterBitcoinSale: String
    , exchangeSource: String
    , exchangeDestination: String
    , sign: String
    , percentage: String
    , sourceHighestBidPrice: String
    , sourceLowestOfferPrice: String
    , targetHighestBidPrice: String
    , targetLowestOfferPrice: String

    }
    
type alias Model =
    { sourceCountry : Maybe String
    , sourceCurrency : String
    , sourceExchange : Maybe String
    , targetCountry : Maybe String
    , targetCurrency : String
    , targetExchange : Maybe String
    , amount : String
    , sourcePossibleExchanges : Maybe (List String)
    , targetPossibleExchanges : Maybe (List String)
    , countriesList: SupportedCountries
    , arbitrageResponse : Maybe ArbitrageResponse
    , waitingResponse : Bool
    , errorMessage : String
    }

-- Update

bySourceCountry : String -> SupportedCountry -> Bool
bySourceCountry country supportedCountry =
    (country == supportedCountry.country)


dealWithEmptyList : Maybe (List String) -> List String
dealWithEmptyList list =
    case list of
        Nothing ->
            [""]

        Just val ->
            "" :: val


dealWithEmptyString : Maybe String -> String
dealWithEmptyString str =
    case str of
        Nothing ->
            ""

        Just val ->
            val

extractErrorMessageString : Result String String -> String
extractErrorMessageString errorMessageDecoderResult =
    case errorMessageDecoderResult of
        Ok errMessage ->
            errMessage
            
        Err decodingErrMessage ->
            "DECODE ERROR : " ++ decodingErrMessage
            
httpErrorString : Error -> String
httpErrorString error =
    case error of
        BadUrl text ->
            "Bad Url: " ++ text
        Timeout ->
            "Http Timeout"
        NetworkError ->
            "Network Error"
        BadStatus response ->
        --    "Error (" ++ toString response.status.code ++ ") " ++ (toString response.body) 
            decodeString errorMessageDecoder response.body |> extractErrorMessageString
        BadPayload message response ->
            "Bad Http Payload: "
                ++ toString message
                ++ " ("
                ++ toString response.status.code
                ++ ")"
                
getExchangesForCountry : String -> SupportedCountries -> Maybe (List String)
getExchangesForCountry country list =
    List.head <|
        List.map (.exchanges) <|
            List.filter (bySourceCountry country) <|
                list


concatSymbolAndName : SupportedCountry -> String
concatSymbolAndName countryRecord =
    (countryRecord.currencySymbol ++ " - " ++ countryRecord.name)
    
getCurrencyForCountry : String -> SupportedCountries -> String
getCurrencyForCountry country list =
    list
    |> List.filter (bySourceCountry country)
    |> List.map (concatSymbolAndName) 
    |> List.head
    |> dealWithEmptyString 

                    
createOptionsForDDLB : String -> String -> String -> Html msg
createOptionsForDDLB errorMessage currentlySelectedExchange exchange =
    if errorMessage /= "" && exchange == currentlySelectedExchange && exchange /= "" then
        Html.option [ (selected True), Html.Attributes.value exchange ] [ Html.text exchange ]
    else if exchange == "" then
        Html.option [ (selected False), Html.Attributes.value exchange ] [ Html.text "-- select --" ]
    else 
        Html.option [ (selected False), Html.Attributes.value exchange ] [ Html.text exchange ]

    -- if (Debug.log "The exchange " exchange) == "" then
    --     Debug.log "SELECTED TRUE" (Html.option [ (selected True), Html.Attributes.value exchange ] [ Html.text "-- select --" ])
    -- else
    --     Debug.log "SELECTED false" (Html.option [ (selected False), Html.Attributes.value exchange ] [ Html.text exchange ])

getSignDIV : ArbitrageResponse -> Html Msg
getSignDIV arbitrageResponse =
    if (arbitrageResponse.sign == "+") then
        Html.div [class [ TopResult ] ] 
            [ Html.img [ Html.Attributes.src "/assets/arrowup.gif", Html.Attributes.height 30, Html.Attributes.width 30] []
            , Html.span [] [ Html.text "Bitcoin is beating spot rate by " ]
            , Html.span [] [ Html.text (arbitrageResponse.percentage) ]
--            , Html.button [onClick DetailResponseExpandOrContract ] [ Html.text "Details"]
            ]
    else if (arbitrageResponse.sign == "-") then
        Html.div [class [ TopResult ] ] 
            [ Html.img [ Html.Attributes.src "/assets/arrowdown.gif", Html.Attributes.height 30, Html.Attributes.width 30] []
            , Html.span [] [ Html.text "Bitcoin is losing to spot rate by " ]
            , Html.span [] [ Html.text arbitrageResponse.percentage ]
--            , Html.button [onClick DetailResponseExpandOrContract ] [ Html.text "Details"]
            ]
    else
        Html.div [] []

showInputForm : Model -> Html Msg
showInputForm model =
    case model.arbitrageResponse of
        Nothing ->
            if model.waitingResponse == False then
                Html.div []
                    [ Html.div [ class [ SourceCountry ] ]
                        [ Html.div [ class [FormLine] ] 
                            [ Html.span [] [Html.text "Source country: "]
                            -- append an empty country to the beginning of the countriesList (emptyCountry :: model.countriesList)
                            , Html.select [ on "change" (Json.map SourceCountrySelected targetValue) ] (List.map (countryDDLB model.errorMessage (toEmpty model.sourceCountry)) (emptyCountry :: model.countriesList))
                            ]
                        , Html.div [class [FormLine]] [ Html.span [] [Html.text ("Currency: " ++ model.sourceCurrency)] ]
                        , Html.div [class [FormLine]] 
                            [ Html.span [] [Html.text "Exchange: "]
                            , Html.select [ on "change" (Json.map SourceExchangeSelected targetValue) ]
                              (List.map (createOptionsForDDLB model.errorMessage (toEmpty model.sourceExchange)) (dealWithEmptyList model.sourcePossibleExchanges))
                            ]
                        , Html.div [class [FormLine]] 
                            [ Html.span [] [Html.text "Amount: "]
                            , Html.input
                                [ type_ "text"
                                , placeholder "0.00"
                                , onInput InputAmount
                                , Html.Attributes.value model.amount
                                ]
                                []
                            ]
                        ]
                    , Html.div [ class [ TargetCountry ] ]
                        [ Html.div [class [FormLine]] 
                            [ Html.span [] [Html.text "Target country: "]
                            , Html.select [ on "change" (Json.map TargetCountrySelected targetValue) ] (List.map (countryDDLB model.errorMessage (toEmpty model.targetCountry)) (emptyCountry :: model.countriesList))
                            ]
                        , Html.div [class [FormLine]] [ Html.span [] [Html.text ("Currency: " ++ model.targetCurrency)] ]
                        , Html.div [class [FormLine]] 
                            [ Html.span [] [Html.text "Exchange: "]
                            , Html.select [ on "change" (Json.map TargetExchangeSelected targetValue) ]
                                (List.map (createOptionsForDDLB model.errorMessage (toEmpty model.targetExchange)) (dealWithEmptyList model.targetPossibleExchanges))
                            ]
                        ]
                    ]
            else
                Html.text ""
                
        Just val ->
            Html.text ""

showButton : Model -> Html Msg
showButton model =
    case model.arbitrageResponse of
        Nothing ->
            if model.waitingResponse == False then
                Html.div [ class [ButtonDiv] ] [ Html.button [ class [Button], onClick FetchArbitrageResult] [Html.text "Go"] ]
            else 
                Html.text ""
        
        Just val ->
            Html.div [ class [ButtonDiv] ] [ Html.button [ class [Button], onClick ClearArbitrageResult] [Html.text "Clear"] ]
        
showResult : Model -> Html Msg
showResult model =
    case model.arbitrageResponse of
        Nothing ->
            if model.errorMessage /= "" then
                Html.div [] [ Html.p [ class [Error] ] [ Html.text model.errorMessage ] ]
            else
                Html.text ""
            
        Just val ->
            Html.div [ class [Result]] 
                [ (getSignDIV (getArbitrageResponse model.arbitrageResponse)) 
                , Html.div [class [BottomResult] ] 
                    [Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Spot Rate:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).currencyPair ++ " " ++ (getArbitrageResponse model.arbitrageResponse).spotRate)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Amount in source currency:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).amountInSourceCurrency)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Amount in target currency using SPOT RATE:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).amountInDestinationCurrencyUsingSpotRate)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Amount in target currency using BITCOIN:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).amountInDestinationCurrencyAfterBitcoinSale)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Bitcoins bought at source country:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).numberOfBitcoinsBoughtAtOrigin)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Source exchange:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).exchangeSource)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Target exchange:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).exchangeDestination)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Source highest bid price:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).sourceHighestBidPrice)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Target highest bid price:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).targetHighestBidPrice)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Source lowest offer price:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).sourceLowestOfferPrice)] ]
                   , Html.div [class [Rowgrid] ] [ Html.div [class [ CRol ] ] [Html.text "Target lowest offer price:"], Html.div [class [ CRol ] ] [Html.text ((getArbitrageResponse model.arbitrageResponse).targetLowestOfferPrice)] ]
                   ]
                ]

showSpinner : Model -> Html Msg
showSpinner model = 
    case model.waitingResponse of
        True ->
            Html.div [ Html.Attributes.class "spinner"] 
                [ Html.div [Html.Attributes.class "rect1"] []
                , Html.div [Html.Attributes.class "rect2"] []
                , Html.div [Html.Attributes.class "rect3"] []
                , Html.div [Html.Attributes.class "rect4"] []
                , Html.div [Html.Attributes.class "rect5"] []
                ]     
        
        False ->            Html.text ""

countryDDLB : String -> String -> SupportedCountry -> Html Msg
countryDDLB errorMessage currentlySelectedCountry supportedCountry =
    -- if supportedCountry.country == "" then
    --     Html.option [ (selected True), Html.Attributes.value supportedCountry.country ] [ Html.text "-- select --" ]
    -- else
    --     Html.option [ (selected False), Html.Attributes.value supportedCountry.country ] [ Html.text supportedCountry.country ]
    if errorMessage /= "" && supportedCountry.country == currentlySelectedCountry && supportedCountry.country /= "" then
        Html.option [ (selected True), Html.Attributes.value supportedCountry.country ] [ Html.text supportedCountry.country ]
    else if supportedCountry.country == "" then
        Html.option [ (selected False), Html.Attributes.value supportedCountry.country ] [ Html.text "-- select --" ]
    else 
        Html.option [ (selected False), Html.Attributes.value supportedCountry.country ] [ Html.text supportedCountry.country ]


-- exchangesDecoder : Decoder Exchanges
-- exchangesDecoder = 
--     Json.Decode.map Exchanges (field "name" string)

supportedCountriesDecoder : Decoder (List SupportedCountry)
supportedCountriesDecoder =
    Json.Decode.list supportedCountryDecoder 
    
supportedCountryDecoder : Decoder SupportedCountry
supportedCountryDecoder =
    Json.Decode.map4 SupportedCountry
         (field "country" string)
         (field "currencySymbol" string)
         (field "name" string)
         (field "exchanges" (Json.Decode.list string))

errorMessageDecoder : Decoder String
errorMessageDecoder = 
    at ["error", "message"] string
    
arbitrageResponseDecoder : Decoder ArbitrageResponse
arbitrageResponseDecoder = 
    decode ArbitrageResponse
    |> Json.Decode.Pipeline.required "spotRate" string 
    |> Json.Decode.Pipeline.required "currencyPair" string
    |> Json.Decode.Pipeline.required "amountInSourceCurrency" string
    |> Json.Decode.Pipeline.required "amountInDestinationCurrencyUsingSpotRate" string
    |> Json.Decode.Pipeline.required "numberOfBitcoinsBoughtAtOrigin" string
    |> Json.Decode.Pipeline.required "amountInDestinationCurrencyAfterBitcoinSale" string
    |> Json.Decode.Pipeline.required "exchangeSource" string
    |> Json.Decode.Pipeline.required "exchangeDestination" string
    |> Json.Decode.Pipeline.required "sign" string
    |> Json.Decode.Pipeline.required "percentage" string
    |> Json.Decode.Pipeline.required "sourceHighestBidPrice" string
    |> Json.Decode.Pipeline.required "sourceLowestOfferPrice" string
    |> Json.Decode.Pipeline.required "targetHighestBidPrice" string
    |> Json.Decode.Pipeline.required "targetLowestOfferPrice" string
    |> at ["data"]
    
initModel : Model
initModel =
    { sourceCountry = Nothing
    , sourceCurrency = ""
    , sourceExchange = Nothing
    , targetCountry = Nothing
    , targetCurrency = ""
    , targetExchange = Nothing
    , sourcePossibleExchanges = Nothing
    , targetPossibleExchanges = Nothing
    , amount = "1000.00"
    , countriesList = [emptyCountry]
    , arbitrageResponse = Nothing
    , waitingResponse = False
    , errorMessage = ""
    }

init : (Model, Cmd Msg)
init =
    (initModel, getSupportedCountriesCommand )
    
getSupportedCountriesCommand : Cmd Msg
getSupportedCountriesCommand =
    let 
        url = 
            "/api/countries"
            
        request =
            Http.get url supportedCountriesDecoder
            
        cmd = 
            Http.send SupportedCountriesRequested request
    in
        cmd

toEmpty : Maybe String -> String
toEmpty a =
    case a of 
        Nothing -> 
            ""
            
        Just a ->
            a

getArbitrageResponse : Maybe ArbitrageResponse -> ArbitrageResponse
getArbitrageResponse arbitrageResponse =
    case arbitrageResponse of
        Nothing ->
            { spotRate = ""
            , currencyPair = ""
            , amountInSourceCurrency = ""
            , amountInDestinationCurrencyUsingSpotRate = ""
            , numberOfBitcoinsBoughtAtOrigin = ""
            , amountInDestinationCurrencyAfterBitcoinSale = ""
            , exchangeSource = ""
            , exchangeDestination = ""
            , sign = ""
            , percentage = ""
            , sourceHighestBidPrice = ""
            , sourceLowestOfferPrice = ""
            , targetHighestBidPrice = ""
            , targetLowestOfferPrice = ""
            }
        
        Just arbitrageResponse ->
            arbitrageResponse

postRequestCommand : Model -> Cmd Msg
postRequestCommand model =
    let 
        url = "/api/arbitrage?sourceCountry=" ++ (toEmpty model.sourceCountry) 
                                            ++ "&targetCountry=" 
                                            ++ (toEmpty model.targetCountry)
                                            ++ "&amount=" 
                                            ++ model.amount
                                            ++ "&sourceExchange=" 
                                            ++ (toEmpty model.sourceExchange) 
                                            ++ "&targetExchange="
                                            ++ (toEmpty model.targetExchange)
        request =
            Http.get url arbitrageResponseDecoder
            
        cmd = 
            Http.send ArbitrageRequested request
    in
        cmd
        

type Msg
    = Clear
    | SupportedCountriesRequested (Result Http.Error SupportedCountries)
    | ArbitrageRequested (Result Http.Error ArbitrageResponse)
    | FetchArbitrageResult
    | ClearArbitrageResult
    | DetailResponseExpandOrContract
    | SourceCountrySelected String
    | TargetCountrySelected String
    | SourceExchangeSelected String
    | TargetExchangeSelected String
    | SelectSourceExchange
    | InputAmount String

-- update

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SupportedCountriesRequested (Ok supportedCountries) ->
            ( { model
                 | countriesList = supportedCountries }, Cmd.none)

        SupportedCountriesRequested (Err err) ->
            ( model, Cmd.none)
            
        SourceCountrySelected newCountry ->
             ({ model
                | sourceCountry = Just newCountry
                , sourceCurrency = (getCurrencyForCountry newCountry model.countriesList)
                , sourcePossibleExchanges = (getExchangesForCountry newCountry model.countriesList)
                , sourceExchange = Just ""
            }, Cmd.none)

        ArbitrageRequested (Ok response) ->
            ( { model | arbitrageResponse = Just response, errorMessage = "", waitingResponse = False }, Cmd.none)

        ArbitrageRequested (Err err) ->
            ( { model | errorMessage = (httpErrorString err), waitingResponse = False }, Cmd.none )

        TargetCountrySelected newCountry ->
            { model
                | targetCountry = Just newCountry
                , targetCurrency = (getCurrencyForCountry newCountry model.countriesList)
                , targetPossibleExchanges = (getExchangesForCountry newCountry model.countriesList)
                , targetExchange = Just ""
            }
                ! []

        SourceExchangeSelected newExchange ->
            { model
                | sourceExchange = Just newExchange
            }
                ! []

        TargetExchangeSelected newExchange ->
            { model
                | targetExchange = Just newExchange
            }
                ! []

        InputAmount newAmount ->
            { model | amount = newAmount } ! []
            
        FetchArbitrageResult ->
            { model | arbitrageResponse = Nothing, waitingResponse = True, errorMessage = "" } ! [postRequestCommand model]

        ClearArbitrageResult ->
            { model | 
              sourceCountry = Nothing
            , sourceCurrency = ""
            , sourceExchange = Nothing
            , targetCountry = Nothing
            , targetCurrency = ""
            , targetExchange = Nothing
            , amount = "1000.00"
            , arbitrageResponse = Nothing
            , waitingResponse = False
            , errorMessage = "" } ! []
        _ ->
            model ! []


view : Model -> Html Msg
view model =
    Html.div []
        [ showInputForm model
          --  , Html.div [] [Html.text (toString model.sourceExchange),  Html.text (toString model.targetExchange)]
        , showResult model 
        , showSpinner model
        , showButton model 
        ]
        
    
-- <div id="result">
--   <p *ngIf="errorMessage.length > 0">{{errorMessage}}</p>
--   <div *ngIf="errorMessage.length == 0">
--       <div class="topResult" *ngIf="arbitrage.sign == '+'">
--          <img src="/assets/arrowup.gif" height="30" width="30">
--          <span>Bitcoin is beating spot rate by&nbsp;</span><span class="percentageplus">{{arbitrage.percentage}}</span><button (click)="details()">Details</button>
--       </div>
--       <div class="topResult" *ngIf="arbitrage.sign == '-'">
--          <img src="/assets/arrowdown.gif"  height="30" width="30">
--          <span>Bitcoin is losing to spot rate by&nbsp;</span><span class="percentageminus">{{arbitrage.percentage}}</span><button (click)="details()">Details</button>
--       </div>
--       <div class="bottomResult" *ngIf="detailsOpen">
--          <div class="rowgrid"><div class="col">Spot Rate:</div><div class="col">{{arbitrage.currencyPair}}&nbsp;{{arbitrage.spotRate}}</div></div>
--          <div class="rowgrid"><div class="col">Amount in source currency:</div><div class="col">{{arbitrage.amountInSourceCurrency}}</div></div>
--          <div class="rowgrid"><div class="col">Amount in target currency using SPOT RATE:</div><div class="col">{{arbitrage.amountInDestinationCurrencyUsingSpotRate}}</div></div>
--          <div class="rowgrid"><div class="col">Amount in target currency using BITCOIN:</div><div class="col">{{arbitrage.amountInDestinationCurrencyAfterBitcoinSale}}</div></div>
--          <div class="rowgrid"><div class="col">Bitcoins bought at source country:</div><div class="col">{{arbitrage.numberOfBitcoinsBoughtAtOrigin}}</div></div>
--          <div class="rowgrid"><div class="col">Source exchange:</div><div class="col"> {{arbitrage.exchangeSource}}</div></div>
--          <div class="rowgrid"><div class="col">Target exchange:</div><div class="col"> {{arbitrage.exchangeDestination}}</div></div>
--       </div>
--   </div>
-- </div>    

main : Program Never Model Msg
main =
    Html.program
        { view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        , init = init
        }
