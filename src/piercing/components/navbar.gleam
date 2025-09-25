import lustre/attribute
import lustre/element
import lustre/element/html

pub type Route {
  Home
  Gallery
  About
  Contact
  AvisoLegal
  PoliticaPrivacidad
  PoliticaCookies
}

fn get_nav_class(current_route: Route, button_route: Route) -> String {
  let base_class =
    "nav-button border-2 border-transparent text-white px-2 py-1 lg:text-2xl sm:px-4 sm:py-2 sm:text-base font-bold tracking-wide"
  case current_route == button_route {
    True -> base_class <> " active"
    False -> base_class
  }
}

pub fn navbar(current_route: Route) {
  html.nav(
    [
      attribute.class(
        "font-[Dark_Reborn] bg-black/50 navbar-metallic-border px-4 sm:px-6 lg:px-8 lg:pt-5 sm:py-4 sticky top-0 z-50",
      ),
      attribute.style(
        "background",
        "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 100%)",
      ),
    ],
    [
      html.div(
        [
          attribute.class(
            "flex flex-col sm:flex-row justify-items-center justify-between items-center mx-auto w-full relative",
          ),
        ],
        [
          html.div(
            [attribute.class("nav-brand mb-2 sm:mb-0 sm:left-0 mt-5 lg:mt-0")],
            [
              html.a(
                [
                  attribute.class(
                    "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-white",
                  ),
                  attribute.href("/"),
                ],
                [element.text("EI  PINX")],
              ),
            ],
          ),
          html.div(
            [
              attribute.class(
                "flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center",
              ),
            ],
            [
              html.a(
                [
                  attribute.class(get_nav_class(current_route, Gallery)),
                  attribute.href("/gallery"),
                ],
                [element.text(set_text_gallery(current_route))],
              ),
              html.a(
                [
                  attribute.class(get_nav_class(current_route, About)),
                  attribute.href("/about"),
                ],
                [element.text(set_text_about(current_route))],
              ),
              html.a(
                [
                  attribute.class(get_nav_class(current_route, Contact)),
                  attribute.href("/contact"),
                ],
                [element.text(set_text_contact(current_route))],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

fn set_text_contact(route: Route) -> String {
  case route {
    Contact -> "CONACTO"
    _ -> "CONTACTO"
  }
}

fn set_text_gallery(route: Route) -> String {
  case route {
    Gallery -> "GALRÍA"
    _ -> "GALERÍA"
  }
}

fn set_text_about(route: Route) -> String {
  case route {
    About -> "SORE MI"
    _ -> "SOBRE MI"
  }
}
