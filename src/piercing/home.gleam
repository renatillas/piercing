import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event
import piercing/gallery

pub fn home_page(set_category_filter_event) {
  html.div(
    [
      attribute.class("relative min-h-screen"),
    ],
    [
      hero(),
      esteril(set_category_filter_event),
      premium(set_category_filter_event),
      experiencia(set_category_filter_event),
    ],
  )
}

fn hero() {
  html.section(
    [
      attribute.class(
        "relative text-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8",
      ),
    ],
    [
      html.div([attribute.class("max-w-7xl mx-auto")], [
        html.div(
          [
            attribute.class(
              "grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center",
            ),
          ],
          [
            // Avatar (left on large screens)
            html.div(
              [attribute.class("order-1 lg:order-1 flex justify-center")],
              [
                html.div(
                  [
                    attribute.class(
                      "w-80 h-96 lg:w-96 lg:h-[32rem] bg-white rounded-lg flex items-center justify-center overflow-hidden",
                    ),
                  ],
                  [
                    html.img([
                      attribute.src("/priv/static/profile_picture.jpeg"),
                      attribute.alt("Avatar de Kei"),
                      attribute.class("w-full h-full object-cover"),
                      attribute.fetchpriority("high"),
                      attribute.loading("eager"),
                    ]),
                  ],
                ),
              ],
            ),
            // Text content (right on large screens)
            html.div(
              [
                attribute.class(
                  "flex max-w-xl flex-col order-2 lg:order-2 text-center lg:text-left",
                ),
              ],
              [
                html.h1(
                  [
                    attribute.class(
                      "pb-3 text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-wide font-[Dark_Reborn]",
                    ),
                  ],
                  [element.text("ola, soy e")],
                ),
                html.p(
                  [
                    attribute.class(
                      "text-lg text-left sm:text-xl text-gray-300 mb-8 max-w-lg mx-6 leading-relaxed",
                    ),
                  ],
                  [
                    element.text(
                      "Anilladora aprendiz en proceso de convertirse en un profesional más del mundo del body piercing. Cada día me esfuerzo por perfeccionar mis técnicas y brindar el mejor servicio. Mi pasión por el arte corporal me impulsa a seguir creciendo en esta hermosa profesión.",
                    ),
                  ],
                ),
                html.a(
                  [
                    attribute.class(
                      "self-center text-center inline-block text-white border-2 border-white px-8 py-3 text-lg font-bold tracking-wide hover:bg-white hover:text-black transition-all duration-300 ",
                    ),
                    attribute.href("/about"),
                  ],
                  [element.text("Saber más")],
                ),
              ],
            ),
          ],
        ),
      ]),
    ],
  )
}

pub fn esteril(set_category_filter_event) {
  html.section(
    [
      attribute.class("px-4 sm:px-6 lg:px-8 py-12 sm:py-16"),
    ],
    [
      html.div(
        [
          attribute.class("max-w-7xl mx-auto"),
        ],
        [
          html.div(
            [
              attribute.class(
                "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
              ),
            ],
            [
              // Text content
              html.div(
                [
                  attribute.class("justify-items-center order-2 lg:order-1"),
                ],
                [
                  html.h2(
                    [
                      attribute.class(
                        "font-[Dark_Reborn] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-wide",
                      ),
                    ],
                    [element.text("stéri")],
                  ),
                  html.p(
                    [
                      attribute.class(
                        "text-xl text-gray-300 mb-8 leading-relaxed",
                      ),
                    ],
                    [
                      element.text(
                        "Todo el equipo esterilizado usando tecnología de autoclave",
                      ),
                    ],
                  ),
                ],
              ),
              // Image
              html.a(
                [
                  attribute.class("order-1 lg:order-2 group "),
                  event.on_click(
                    set_category_filter_event(gallery.Ear(gallery.EarAll)),
                  ),
                  attribute.style(
                    "background",
                    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.9) 95%)",
                  ),
                  attribute.href("/gallery"),
                ],
                [
                  html.div(
                    [
                      attribute.class("relative overflow-hidden rounded-lg"),
                    ],
                    [
                      html.img([
                        attribute.src("/priv/static/oreja.jpeg"),
                        attribute.alt("Perforaciones de oreja"),
                        attribute.class(
                          "w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-300",
                        ),
                        attribute.attribute("loading", "lazy"),
                      ]),
                      html.div(
                        [
                          attribute.class(
                            "absolute bottom-0 left-0 right-0 text-white p-4",
                          ),
                          attribute.style(
                            "background",
                            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.8) 100%)",
                          ),
                        ],
                        [
                          html.p([attribute.class("text-xl font-medium")], [
                            element.text("Perforaciones de oreja"),
                          ]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

pub fn premium(set_category_filter_event) {
  html.section(
    [
      attribute.class("px-4 sm:px-6 lg:px-8 py-12 sm:py-16"),
    ],
    [
      html.div(
        [
          attribute.class("max-w-7xl mx-auto"),
        ],
        [
          html.div(
            [
              attribute.class(
                "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
              ),
            ],
            [
              // Image (left on large screens)
              html.a(
                [
                  attribute.class("order-1 lg:order-1 group "),
                  event.on_click(
                    set_category_filter_event(gallery.Ear(gallery.EarAll)),
                  ),
                  attribute.href("/gallery"),
                ],
                [
                  html.div(
                    [
                      attribute.class("relative overflow-hidden rounded-lg"),
                    ],
                    [
                      html.img([
                        attribute.src("/priv/static/ceja-1.heic"),
                        attribute.alt("Perforaciones faciales"),
                        attribute.class(
                          "w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-300",
                        ),
                        attribute.attribute("loading", "lazy"),
                      ]),
                      html.div(
                        [
                          attribute.class(
                            "absolute bottom-0 left-0 right-0 text-white p-4",
                          ),
                          attribute.style(
                            "background",
                            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.8) 100%)",
                          ),
                        ],
                        [
                          html.p([attribute.class("text-xl font-medium")], [
                            element.text("Perforaciones faciales"),
                          ]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              // Text content (right on large screens)
              html.div(
                [
                  attribute.class(
                    "justify-items-center order-2 lg:order-2 lg:text-right",
                  ),
                ],
                [
                  html.h2(
                    [
                      attribute.class(
                        "font-[Dark_Reborn] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-wide",
                      ),
                    ],
                    [element.text("remiu")],
                  ),
                  html.p(
                    [
                      attribute.class(
                        "text-xl text-gray-300 mb-8 leading-relaxed",
                      ),
                    ],
                    [
                      element.text(
                        "Joyería de acero quirúrgico y titanio de alta calidad",
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

fn experiencia(set_category_filter_event) {
  html.section(
    [
      attribute.class("px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:pb-20"),
    ],
    [
      html.div(
        [
          attribute.class("max-w-7xl mx-auto"),
        ],
        [
          html.div(
            [
              attribute.class(
                "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
              ),
            ],
            [
              // Text content
              html.div(
                [attribute.class("justify-items-center order-2 lg:order-1")],
                [
                  html.h2(
                    [
                      attribute.class(
                        "font-[Dark_Reborn] text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-wide",
                      ),
                    ],
                    [element.text("xperienci")],
                  ),
                  html.p(
                    [
                      attribute.class(
                        "text-xl text-gray-300 mb-8 leading-relaxed",
                      ),
                    ],
                    [
                      element.text(
                        "Más de 7 meses de experiencia profesional en perforaciones",
                      ),
                    ],
                  ),
                ],
              ),
              // Image
              html.a(
                [
                  attribute.class("order-1 lg:order-2 group "),
                  event.on_click(
                    set_category_filter_event(gallery.Body(gallery.BodyAll)),
                  ),
                  attribute.href("/gallery"),
                ],
                [
                  html.div(
                    [
                      attribute.class("relative overflow-hidden rounded-lg"),
                    ],
                    [
                      html.img([
                        attribute.src("/priv/static/cuerpo.heic"),
                        attribute.alt("Perforaciones corporales"),
                        attribute.class(
                          "w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-300",
                        ),
                        attribute.attribute("loading", "lazy"),
                      ]),
                      html.div(
                        [
                          attribute.class(
                            "absolute bottom-0 left-0 right-0 text-white p-4",
                          ),
                          attribute.style(
                            "background",
                            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.8) 100%)",
                          ),
                        ],
                        [
                          html.p([attribute.class("text-xl font-medium")], [
                            element.text("Perforaciones corporales"),
                          ]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
