import gleam/option
import gleam/result
import gleam/uri
import lustre
import lustre/attribute
import lustre/effect
import lustre/element.{type Element}
import lustre/element/html
import lustre/event
import modem

pub type Model {
  Model(route: Route, modal: ModalState)
}

pub type ModalState {
  Closed
  Open(image_src: String, image_alt: String)
}

pub type Route {
  Home
  Gallery
  About
  Contact
}

pub type Msg {
  OnRouteChange(Route)
  OpenModal(String, String)
  CloseModal
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
  #(Model(route: route, modal: Closed), modem.init(on_route_change))
}

fn uri_to_route(uri: uri.Uri) -> Route {
  uri.path_segments(uri.path)
  |> fn(path) {
    case path {
      [] -> Home
      ["gallery"] -> Gallery
      ["about"] -> About
      ["contact"] -> Contact
      _ -> Home
    }
  }
}

fn on_route_change(uri: uri.Uri) -> Msg {
  let route = uri_to_route(uri)
  OnRouteChange(route)
}

fn update(model: Model, msg: Msg) {
  case msg {
    OnRouteChange(route) -> #(
      Model(route: route, modal: model.modal),
      modem.replace(
        case route {
          Home -> "/"
          Gallery -> "/gallery"
          About -> "/about"
          Contact -> "/contact"
        },
        option.None,
        option.None,
      ),
    )
    OpenModal(src, alt) -> #(
      Model(route: model.route, modal: Open(src, alt)),
      effect.none(),
    )
    CloseModal -> #(Model(route: model.route, modal: Closed), effect.none())
  }
}

fn view(model: Model) -> Element(Msg) {
  html.div([attribute.class("min-h-screen bg-black/80 black text-white")], [
    navbar(),
    case model.route {
      Home -> home_page()
      Gallery -> gallery_page()
      About -> about_page()
      Contact -> contact_page()
    },
    modal_view(model.modal),
  ])
}

fn navbar() -> Element(Msg) {
  html.nav(
    [
      attribute.class(
        "bg-black/50 border-b-2 border-gray-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50",
      ),
    ],
    [
      html.div([attribute.class("nav-brand mb-2 sm:mb-0")], [
        html.h1(
          [
            attribute.class(
              "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-white",
            ),
          ],
          [element.text("EI  PINX")],
        ),
      ]),
      html.div(
        [
          attribute.class(
            "flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center sm:justify-end",
          ),
        ],
        [
          html.a(
            [
              attribute.class(
                "border-2 border-transparent text-white px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/"),
            ],
            [element.text("INICIO")],
          ),
          html.a(
            [
              attribute.class(
                "border-2 border-transparent text-white px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/gallery"),
            ],
            [element.text("GALERÍA")],
          ),
          html.a(
            [
              attribute.class(
                "border-2 border-transparent text-white px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/about"),
            ],
            [element.text("ACERCA")],
          ),
          html.a(
            [
              attribute.class(
                "border-2 border-transparent text-white px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/contact"),
            ],
            [element.text("CONTACTO")],
          ),
        ],
      ),
    ],
  )
}

fn home_page() -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
      ),
    ],
    [
      html.div(
        [
          attribute.class(
            "text-center py-8 sm:py-12 lg:py-16 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 sm:mb-8 lg:mb-12 border-b-2 border-gray-700",
          ),
        ],
        [
          html.h2(
            [
              attribute.class(
                "text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent tracking-wide sm:tracking-widest",
              ),
            ],
            [element.text("PERFORACIONES PREMIUM")],
          ),
          html.p(
            [
              attribute.class(
                "text-lg sm:text-xl mb-6 sm:mb-8 text-gray-300 max-w-2xl mx-auto px-4 sm:px-0",
              ),
            ],
            [
              element.text(
                "Perforaciones profesionales con técnicas estériles y joyería premium",
              ),
            ],
          ),
          html.a(
            [
              attribute.class(
                "text-white border-2 border-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold tracking-wide sm:tracking-widest hover:bg-white hover:text-black transform hover:-translate-y-1 hover:shadow-lg hover:shadow-white/30 transition-all duration-300",
              ),
              attribute.href("/gallery"),
            ],
            [element.text("VER NUESTRO TRABAJO")],
          ),
        ],
      ),
      html.div(
        [
          attribute.class("mb-12 sm:mb-16 lg:mb-20"),
        ],
        [
          html.h3(
            [
              attribute.class(
                "text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 tracking-wide text-white",
              ),
            ],
            [element.text("NUESTROS TRABAJOS")],
          ),
          html.div(
            [
              attribute.class(
                "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto",
              ),
            ],
            [
              html.button(
                [
                  attribute.class(
                    "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group cursor-pointer",
                  ),
                  event.on_click(OpenModal(
                    "/priv/static/oreja.jpeg",
                    "Perforación de oreja",
                  )),
                ],
                [
                  html.img([
                    attribute.src("/priv/static/oreja.jpeg"),
                    attribute.class(
                      "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                    ),
                    attribute.alt("Perforación de oreja"),
                  ]),
                ],
              ),
              html.button(
                [
                  attribute.class(
                    "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group cursor-pointer",
                  ),
                  event.on_click(OpenModal(
                    "/priv/static/lengua.jpeg",
                    "Perforación de lengua",
                  )),
                ],
                [
                  html.img([
                    attribute.src("/priv/static/lengua.jpeg"),
                    attribute.class(
                      "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                    ),
                    attribute.alt("Perforación de lengua"),
                  ]),
                ],
              ),
              html.button(
                [
                  attribute.class(
                    "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group cursor-pointer",
                  ),
                  event.on_click(OpenModal(
                    "/priv/static/ceja.heic",
                    "Perforación de ceja",
                  )),
                ],
                [
                  html.img([
                    attribute.src("/priv/static/ceja.heic"),
                    attribute.class(
                      "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                    ),
                    attribute.alt("Perforación de ceja"),
                  ]),
                ],
              ),
              html.button(
                [
                  attribute.class(
                    "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group cursor-pointer",
                  ),
                  event.on_click(OpenModal(
                    "/priv/static/cuerpo.heic",
                    "Perforación corporal",
                  )),
                ],
                [
                  html.img([
                    attribute.src("/priv/static/cuerpo.heic"),
                    attribute.class(
                      "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                    ),
                    attribute.alt("Perforación corporal"),
                  ]),
                ],
              ),
            ],
          ),
        ],
      ),
      html.div(
        [
          attribute.class(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 lg:mt-12",
          ),
        ],
        [
          feature_card(
            "ESTÉRIL",
            "Todo el equipo esterilizado usando tecnología de autoclave",
          ),
          feature_card(
            "PREMIUM",
            "Joyería de titanio y acero quirúrgico de alta calidad",
          ),
          feature_card(
            "EXPERIENCIA",
            "Más de 2 años de experiencia profesional en perforaciones",
          ),
        ],
      ),
    ],
  )
}

fn gallery_page() -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
      ),
    ],
    [
      html.h2(
        [
          attribute.class(
            "text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 tracking-wide sm:tracking-widest text-white",
          ),
        ],
        [element.text("GALERÍA DE PERFORACIONES")],
      ),
      html.div(
        [
          attribute.class(
            "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8",
          ),
        ],
        [
          piercing_card(
            "Perforaciones de Oreja",
            "Helix, tragus, conch y más",
            "/priv/static/oreja.jpeg",
          ),
          piercing_card(
            "Perforaciones Faciales",
            "Nariz, ceja, labio y septum",
            "/priv/static/ceja.heic",
          ),
          piercing_card(
            "Perforaciones Corporales",
            "Ombligo, lengua y superficie",
            "/priv/static/cuerpo.heic",
          ),
          piercing_card(
            "Joyería Personalizada",
            "Piezas únicas para tu estilo",
            "/priv/static/lengua.jpeg",
          ),
        ],
      ),
    ],
  )
}

fn about_page() -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
      ),
    ],
    [
      html.h2(
        [
          attribute.class(
            "text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 tracking-wide sm:tracking-widest text-white",
          ),
        ],
        [element.text("ACERCA DE NOSOTROS")],
      ),
      html.div(
        [
          attribute.class(
            "max-w-4xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-700",
          ),
        ],
        [
          html.p(
            [
              attribute.class(
                "mb-4 sm:mb-6 text-base sm:text-lg text-gray-300 leading-relaxed",
              ),
            ],
            [
              element.text(
                "Kei Te Pinxa es un estudio de perforaciones corporales premier dedicado a proporcionar modificaciones corporales seguras, profesionales y artísticas. Nuestros perforadores experimentados usan solo materiales de la más alta calidad y mantienen los estándares de higiene más estrictos.",
              ),
            ],
          ),
          html.p(
            [
              attribute.class(
                "text-base sm:text-lg text-gray-300 leading-relaxed",
              ),
            ],
            [
              element.text(
                "Creemos que las perforaciones corporales son una forma de arte y expresión personal. Nuestro objetivo es ayudarte a lograr el look que deseas mientras aseguramos tu seguridad y comodidad durante todo el proceso.",
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

fn contact_page() -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
      ),
    ],
    [
      html.h2(
        [
          attribute.class(
            "text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 tracking-wide sm:tracking-widest text-white",
          ),
        ],
        [element.text("CONTACTO")],
      ),
      html.div(
        [
          attribute.class(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto",
          ),
        ],
        [
          html.div(
            [
              attribute.class(
                "p-4 sm:p-6 lg:p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 transition-all duration-300",
              ),
            ],
            [
              html.h3(
                [
                  attribute.class(
                    "mb-3 sm:mb-4 text-white text-lg sm:text-xl font-bold tracking-wide",
                  ),
                ],
                [element.text("HORARIOS")],
              ),
              html.p([attribute.class("text-gray-300 mb-2")], [
                element.text("Lun-Sáb: 14pm-8pm"),
              ]),
              html.p([attribute.class("text-gray-300")], [
                element.text("Domingo: Cerrado"),
              ]),
            ],
          ),
          html.div(
            [
              attribute.class(
                "p-4 sm:p-6 lg:p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 transition-all duration-300",
              ),
            ],
            [
              html.h3(
                [
                  attribute.class(
                    "mb-3 sm:mb-4 text-white text-lg sm:text-xl font-bold tracking-wide",
                  ),
                ],
                [element.text("TELÉFONO")],
              ),
              html.p([attribute.class("text-gray-300")], [
                element.text("+34 663 73 66 31"),
              ]),
            ],
          ),
        ],
      ),
    ],
  )
}

fn feature_card(title: String, description: String) -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 hover:shadow-lg hover:shadow-black/30 transition-all duration-300",
      ),
    ],
    [
      html.h3(
        [
          attribute.class(
            "text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white tracking-wide",
          ),
        ],
        [element.text(title)],
      ),
      html.p(
        [attribute.class("text-sm sm:text-base text-gray-300 leading-relaxed")],
        [
          element.text(description),
        ],
      ),
    ],
  )
}

fn piercing_card(
  title: String,
  description: String,
  image_url: String,
) -> Element(Msg) {
  html.div(
    [
      attribute.class(
        "border border-gray-700 overflow-hidden hover:border-white hover:scale-105 hover:shadow-lg hover:shadow-black/30 transition-all duration-300",
      ),
    ],
    [
      html.div(
        [
          attribute.class(
            "h-40 sm:h-48 border-b border-gray-600 relative overflow-hidden",
          ),
        ],
        [
          html.img([
            attribute.src(image_url),
            attribute.class(
              "w-full h-full object-cover hover:scale-110 transition-transform duration-300",
            ),
            attribute.alt(title),
          ]),
        ],
      ),
      html.h3(
        [
          attribute.class(
            "px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2 text-lg sm:text-xl font-bold text-white tracking-wide",
          ),
        ],
        [element.text(title)],
      ),
      html.p(
        [
          attribute.class(
            "px-3 sm:px-4 pb-3 sm:pb-4 text-sm sm:text-base text-gray-300",
          ),
        ],
        [
          element.text(description),
        ],
      ),
    ],
  )
}

fn modal_view(modal: ModalState) -> Element(Msg) {
  case modal {
    Closed -> html.div([], [])
    Open(src, alt) ->
      html.dialog(
        [
          attribute.class(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm m-0 max-w-none max-h-none w-full h-full flex items-center justify-center p-4",
          ),
          attribute.attribute("open", ""),
          event.on_click(CloseModal),
        ],
        [
          html.div(
            [
              attribute.class(
                "metallic-border modal-slide-up relative max-w-4xl max-h-[90vh] bg-black border-2 border-transparent shadow-2xl shadow-black/80",
              ),
              event.on_click(CloseModal),
            ],
            [
              html.button(
                [
                  attribute.class(
                    "absolute top-2 right-2 text-white text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full bg-transparent border border-white/20 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:scale-110 hover:shadow-lg hover:shadow-white/30",
                  ),
                  attribute.attribute("aria-label", "Close modal"),
                  event.on_click(CloseModal),
                ],
                [
                  element.text("×"),
                ],
              ),
              html.figure(
                [
                  attribute.class(
                    "bb-black border border-white/10 relative overflow-hidden m-0",
                  ),
                  event.on_click(CloseModal),
                ],
                [
                  html.img([
                    attribute.src(src),
                    attribute.alt(alt),
                    attribute.class("max-w-full max-h-[80vh] object-contain"),
                  ]),
                  html.figcaption(
                    [
                      attribute.class(
                        "modal-caption-accent bg-transparent border-t border-white/10 p-4 text-center text-gray-300 uppercase tracking-[2px] relative",
                      ),
                      attribute.style(
                        "font-family",
                        "'Dark Reborn', sans-serif",
                      ),
                      attribute.style(
                        "text-shadow",
                        "0 0 10px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.8)",
                      ),
                    ],
                    [
                      element.text(alt),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      )
  }
}
