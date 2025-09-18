import gleam/list
import gleam/result
import gleam/uri
import lustre
import lustre/attribute
import lustre/effect
import lustre/element.{type Element}
import lustre/element/html
import modem
import piercing/about
import piercing/components/footer
import piercing/components/modal
import piercing/components/navbar
import piercing/contact
import piercing/gallery
import piercing/home
import piercing/legal

pub type Route {
  Home
  Gallery
  About
  Contact
  AvisoLegal
  PoliticaPrivacidad
  PoliticaCookies
}

pub type Msg {
  OnRouteChange(Route)
  OpenModal(String, String)
  CloseModal
  SetGalleryFilter(gallery.GalleryFilter)
  ToggleCategory(gallery.CategoryType)
}

pub type Model {
  Model(
    route: Route,
    modal: modal.ModalState,
    gallery_filter: gallery.GalleryFilter,
    collapsed_categories: List(gallery.CategoryType),
  )
}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn init(_flags) {
  let route =
    modem.initial_uri()
    |> result.map(uri_to_route)
    |> result.unwrap(Home)
  #(
    Model(
      route: route,
      modal: modal.Closed,
      gallery_filter: gallery.All,
      collapsed_categories: [
        gallery.EarCategory,
        gallery.BodyCategory,
        gallery.FacialCategory,
        gallery.JewelryCategory,
      ],
    ),
    modem.init(on_route_change),
  )
}

fn uri_to_route(uri: uri.Uri) -> Route {
  uri.path_segments(uri.path)
  |> fn(path) {
    case path {
      [] -> Home
      ["gallery"] -> Gallery
      ["about"] -> About
      ["contact"] -> Contact
      ["aviso-legal"] -> AvisoLegal
      ["politica-privacidad"] -> PoliticaPrivacidad
      ["politica-cookies"] -> PoliticaCookies
      _ -> Home
    }
  }
}

fn on_route_change(uri: uri.Uri) -> Msg {
  let route = uri_to_route(uri)
  OnRouteChange(route)
}

fn route_to_navbar_route(route: Route) -> navbar.Route {
  case route {
    Home -> navbar.Home
    Gallery -> navbar.Gallery
    About -> navbar.About
    Contact -> navbar.Contact
    AvisoLegal -> navbar.AvisoLegal
    PoliticaPrivacidad -> navbar.PoliticaPrivacidad
    PoliticaCookies -> navbar.PoliticaCookies
  }
}

fn update(model: Model, msg: Msg) {
  case msg {
    OnRouteChange(route) -> #(Model(..model, route: route), effect.none())
    OpenModal(src, alt) -> #(
      Model(..model, modal: modal.Open(src, alt)),
      effect.none(),
    )
    CloseModal -> #(Model(..model, modal: modal.Closed), effect.none())
    SetGalleryFilter(filter) -> #(
      Model(..model, gallery_filter: filter),
      effect.none(),
    )
    ToggleCategory(category) -> {
      let all_categories = [
        gallery.EarCategory,
        gallery.BodyCategory,
        gallery.FacialCategory,
        gallery.JewelryCategory,
      ]
      let new_collapsed = case
        list.contains(model.collapsed_categories, category)
      {
        // If clicking on expanded category, collapse all
        False -> all_categories
        // If clicking on collapsed category, expand it and collapse all others
        True -> list.filter(all_categories, fn(c) { c != category })
      }
      #(Model(..model, collapsed_categories: new_collapsed), effect.none())
    }
  }
}

fn view(model: Model) -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "min-h-[100dvh] bg-black/70 black text-white flex flex-col",
      ),
    ],
    [
      html.div([attribute.class("fixed-overlay-1")], []),
      html.div([attribute.class("fixed-overlay-2")], []),
      navbar.navbar(route_to_navbar_route(model.route)),
      html.main([attribute.class("flex-1")], [
        case model.route {
          Home -> home.home_page(SetGalleryFilter, ToggleCategory)
          Gallery ->
            gallery.gallery_page(
              model.gallery_filter,
              filter_event: SetGalleryFilter,
              open_modal_event: OpenModal,
              collapsed_categories: model.collapsed_categories,
              toggle_category_event: ToggleCategory,
            )
          About -> about.about_page()
          Contact -> contact.contact_page()
          AvisoLegal -> legal.legal_page(legal.AvisoLegal)
          PoliticaPrivacidad -> legal.legal_page(legal.PoliticaPrivacidad)
          PoliticaCookies -> legal.legal_page(legal.PoliticaCookies)
        },
      ]),
      footer.footer(),
      modal.modal_view(model.modal, CloseModal),
    ],
  )
}
