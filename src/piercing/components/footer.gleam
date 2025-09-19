import lustre/attribute
import lustre/element
import lustre/element/html

pub fn footer() {
  html.footer(
    [
      attribute.class("relative max-w-dvw"),
    ],
    [
      // Footer divisor image
      html.div(
        [attribute.class("w-full overflow-hidden flex justify-center z-50")],
        [
          html.img([
            attribute.src("/priv/static/footer-divisor.png"),
            attribute.class("shadow max-w-7xl h-auto object-cover"),
            attribute.alt("Footer divisor"),
            attribute.attribute("loading", "lazy"),
          ]),
        ],
      ),
      // Footer content
      html.div(
        [
          attribute.class("relative py-6 px-4 sm:px-6 lg:px-8"),
          attribute.style(
            "background",
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 100%)",
          ),
        ],
        [
          html.div([attribute.class("max-w-7xl mx-auto")], [
            html.div(
              [
                attribute.class(
                  "grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6",
                ),
              ],
              [
                mini_hero(),
                contact_info(),
                hours(),
              ],
            ),
          ]),
        ],
      ),
    ],
  )
}

fn contact_info() {
  html.div([attribute.class("md:text-left")], [
    html.h4(
      [
        attribute.class(
          "text-center text-2xl font-bold text-white mb-3 tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("CONTACTO")],
    ),
    html.p([attribute.class("text-center text-gray-300 mb-2")], [
      element.text("+34 663 73 66 31"),
    ]),
    html.p([attribute.class("text-center text-gray-300 mb-2")], [
      element.text("@keitepinxa"),
    ]),
  ])
}

fn hours() {
  html.div([attribute.class("md:text-left")], [
    html.h4(
      [
        attribute.class(
          "text-center text-2xl font-bold text-white mb-3 tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("HORARIO")],
    ),
    html.p([attribute.class("text-center text-gray-300 mb-2")], [
      element.text("Lunes a Sábado: 14:00 - 20:00"),
    ]),
    html.p([attribute.class("text-center text-gray-300")], [
      element.text("Domingo: Cerrado"),
    ]),
    address(),
  ])
}

fn address() {
  html.div([attribute.class("md:text-left")], [
    html.p([attribute.class("text-center text-gray-300")], [
      element.text("C/ Doctor Jaume Segarra, 4"),
      html.br([]),
      element.text("46019 Valencia, España"),
    ]),
  ])
}

fn legal() {
  html.div([attribute.class("flex gap-2 text-sm text-gray-400")], [
    html.a(
      [
        attribute.class("hover:text-white transition-colors"),
        attribute.href("/aviso-legal"),
      ],
      [
        element.text("Aviso legal"),
      ],
    ),
    html.text("✧"),
    html.a(
      [
        attribute.class("text-center hover:text-white transition-colors"),
        attribute.href("/politica-privacidad"),
      ],
      [
        element.text("Política de privacidad"),
      ],
    ),
    html.text("✧"),
    html.a(
      [
        attribute.class("hover:text-white transition-colors"),
        attribute.href("/politica-cookies"),
      ],
      [
        element.text("Política de Cookies"),
      ],
    ),
  ])
}

fn mini_hero() {
  html.div([attribute.class("")], [
    html.p(
      [
        attribute.class("text-4xl font-bold text-white mb-2"),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("EI  PINX")],
    ),
    html.p([attribute.class("text-gray-300")], [
      element.text("Piercer y modificadora corporal desde 2023"),
    ]),
    html.div([attribute.class("mt-10")], [legal()]),
  ])
}
