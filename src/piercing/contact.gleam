import lustre/attribute
import lustre/element
import lustre/element/html

pub fn contact_page() {
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
        [element.text("ontacta con nosotro")],
      ),
      html.div(
        [
          attribute.class(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto",
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
                [element.text("Horarios")],
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
                [element.text("Teléfono")],
              ),
              html.p([attribute.class("text-gray-300")], [
                element.text("+34 663 73 66 31"),
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
                [element.text("Dirección")],
              ),
              html.p([attribute.class("text-gray-300")], [
                element.text("C/ Doctor Jaume Segarra, 4"),
                html.br([]),
                element.text("46019 Valencia, España"),
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
                [element.text("Instagram")],
              ),
              html.p([attribute.class("text-gray-300")], [
                element.text("@kei_te_pinxa"),
              ]),
            ],
          ),
        ],
      ),
    ],
  )
}
