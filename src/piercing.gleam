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
import piercing/reviews

pub type Route {
  Home
  Gallery
  About
  Contact
  AvisoLegal
  PoliticaPrivacidad
  PoliticaCookies
  Reviews
}

pub type Msg {
  OnRouteChange(Route)
  OpenModal(photo: modal.Image, filtered_photos: List(modal.Image))
  GoToNextPhoto(photo: modal.Image, filtered_photos: List(modal.Image))
  GoToPreviousPhoto(photo: modal.Image, filtered_photos: List(modal.Image))
  CloseModal
  SetGalleryFilter(gallery.GalleryFilter)
}

pub type Model {
  Model(
    route: Route,
    modal: modal.ModalState,
    gallery_filter: gallery.GalleryFilter,
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
    Model(route: route, modal: modal.Closed, gallery_filter: gallery.All),
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
    Reviews -> navbar.Home
  }
}

fn update(model: Model, msg: Msg) {
  case msg {
    OnRouteChange(route) -> #(Model(..model, route: route), effect.none())
    OpenModal(current, filtered_images) -> {
      #(
        Model(..model, modal: modal.Open(current:, filtered_images:)),
        effect.none(),
      )
    }
    GoToNextPhoto(current, filtered_images) -> {
      let photos =
        list.window(filtered_images, 3)
        |> list.filter_map(fn(window) {
          case window {
            [first, second, _] if first == current -> Ok(second)
            [_, second, third] if second == current -> Ok(third)
            _ -> Error(Nil)
          }
        })
      let photos = case photos, filtered_images {
        [], [_, second] -> [second]
        [], [first] -> [first]
        [], [] -> []
        _, _ -> photos
      }
      case photos {
        [next, ..] -> #(
          Model(..model, modal: modal.Open(next, filtered_images)),
          effect.none(),
        )
        [] -> #(
          Model(..model, modal: modal.Open(current, filtered_images)),
          effect.none(),
        )
      }
    }

    GoToPreviousPhoto(current, filtered_images) -> {
      let photos =
        list.window(filtered_images, 3)
        |> list.filter_map(fn(window) {
          case window {
            [_, middle, last] if last == current -> Ok(middle)
            [previous, middle, _] if middle == current -> Ok(previous)
            _ -> Error(Nil)
          }
        })
      let photos = case photos, filtered_images {
        [], [first, _] -> [first]
        [], [first] -> [first]
        [], [] -> []
        _, _ -> photos
      }
      case photos {
        [next, ..] -> #(
          Model(..model, modal: modal.Open(next, filtered_images)),
          effect.none(),
        )
        [] -> #(
          Model(..model, modal: modal.Open(current, filtered_images)),
          effect.none(),
        )
      }
    }
    CloseModal -> #(Model(..model, modal: modal.Closed), effect.none())
    SetGalleryFilter(filter) -> #(
      Model(..model, gallery_filter: filter),
      effect.none(),
    )
  }
}

fn view(model: Model) -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "min-h-[100dvh] bg-black/85 black text-white flex flex-col cursor-[url('/priv/static/cursor-32.png'),auto]",
      ),
    ],
    [
      html.div([attribute.class("fixed-overlay-1")], []),
      html.div([attribute.class("fixed-overlay-2")], []),
      navbar.navbar(route_to_navbar_route(model.route)),
      html.main([attribute.class("flex-1")], [
        case model.route {
          Home -> home.home_page(SetGalleryFilter)
          Gallery ->
            gallery.gallery_page(
              model.gallery_filter,
              filter_event: SetGalleryFilter,
              open_modal_event: OpenModal,
            )
          About -> about.about_page()
          Contact -> contact.contact_page()
          AvisoLegal -> legal.legal_page(legal.AvisoLegal)
          PoliticaPrivacidad -> legal.legal_page(legal.PoliticaPrivacidad)
          PoliticaCookies -> legal.legal_page(legal.PoliticaCookies)
          Reviews -> reviews.reviews()
        },
      ]),
      footer.footer(),
      modal.modal_view(
        model.modal,
        CloseModal,
        GoToPreviousPhoto,
        GoToNextPhoto,
      ),
    ],
  )
}
