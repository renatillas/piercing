import gleam/list
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event
import piercing/components/modal

const categories = [
  #(
    "Oreja",
    Ear(EarAll),
    [
      #("Lóbulo", Ear(Lobulo)),
      #("Hélix", Ear(Helix)),
      #("Industrial", Ear(Industrial)),
      #("Conch", Ear(Conch)),
      #("Tragus", Ear(Tragus)),
      #("Daith", Ear(Daith)),
      #("Flat", Ear(Flat)),
    ],
  ),
  #(
    "Faciales",
    Facial(FacialAll),
    [
      #("Nostril", Facial(Nostril)),
      #("Septum", Facial(Septum)),
      #("Labret", Facial(Labret)),
      #("Ceja", Facial(Ceja)),
      #("Bridge", Facial(Bridge)),
      #("Medusa", Facial(Medusa)),
      #("Venom", Facial(Venom)),
      #("Lengua", Facial(Lengua)),
    ],
  ),
  #(
    "Corporales",
    Body(BodyAll),
    [
      #("Ombligo", Body(Ombligo)),
      #("Surface", Body(Surface)),
      #("Microdermal", Body(Microdermal)),
    ],
  ),
]

pub type GalleryFilter {
  All
  Ear(Ear)
  Facial(Facial)
  Body(Body)
}

pub type Facial {
  FacialAll
  Nostril
  Septum
  Labret
  Ceja
  Bridge
  Medusa
  Venom
  Lengua
}

pub type Body {
  BodyAll
  Ombligo
  Surface
  Microdermal
}

pub type Ear {
  EarAll
  Lobulo
  Helix
  Industrial
  Conch
  Tragus
  Daith
  Flat
}

pub fn gallery_page(
  filter filter: GalleryFilter,
  filter_event filter_event: fn(GalleryFilter) -> a,
  open_modal_event open_modal_event,
) -> Element(a) {
  case filter {
    All -> gallery_home_page(filter_event)
    _ -> gallery_filtered_page(filter, filter_event, open_modal_event)
  }
}

fn gallery_home_page(filter_event: fn(GalleryFilter) -> a) -> Element(a) {
  html.div([attribute.class("min-h-screen")], [
    html.div([attribute.class("px-4 sm:px-6 lg:px-8 py-8 sm:py-12")], [
      html.div([attribute.class("max-w-7xl mx-auto")], [
        html.h1(
          [
            attribute.class(
              "text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 text-white tracking-wide",
            ),
            attribute.style("font-family", "'Dark Reborn', sans-serif"),
          ],
          [element.text("xplora nuestro trabaj")],
        ),
        html.div(
          [attribute.class("grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12")],
          [
            gallery_section_card(
              "Perforaciones de oreja",
              "Hélix, tragus, conch y más",
              Ear(EarAll),
              "/priv/static/lobulo.jpeg",
              filter_event,
            ),
            gallery_section_card(
              "Perforaciones faciales",
              "Nariz, cejas, labios y lengua",
              Facial(FacialAll),
              "/priv/static/nostril-1.jpeg",
              filter_event,
            ),
            gallery_section_card(
              "Perforaciones corporales",
              "Ombligo y dermales",
              Body(BodyAll),
              "/priv/static/ombligo.jpeg",
              filter_event,
            ),
          ],
        ),
      ]),
    ]),
  ])
}

fn gallery_section_card(
  title: String,
  description: String,
  filter: GalleryFilter,
  image_src: String,
  filter_event: fn(GalleryFilter) -> a,
) -> Element(a) {
  html.div(
    [
      attribute.class("gallery-section-card relative group overflow-hidden"),
    ],
    [
      html.div([attribute.class("relative aspect-[4/3] overflow-hidden")], [
        html.img([
          attribute.src(image_src),
          attribute.class(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out",
          ),
          attribute.alt(title),
        ]),
        html.div(
          [
            attribute.class(
              "absolute inset-0 flex flex-col justify-end p-6 text-white",
            ),
            attribute.style(
              "background",
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.9) 95%)",
            ),
          ],
          [
            html.h3(
              [
                attribute.class(
                  "text-2xl lg:text-3xl font-bold mb-2 tracking-wide transform group-hover:scale-105 transition-transform duration-300",
                ),
                attribute.style("font-family", "'Dark Reborn', sans-serif"),
              ],
              [element.text(title)],
            ),
            html.p(
              [
                attribute.class(
                  "text-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300",
                ),
              ],
              [element.text(description)],
            ),
          ],
        ),
      ]),
      html.button(
        [
          attribute.class("absolute inset-0 w-full h-full"),
          event.on_click(filter_event(filter)),
        ],
        [],
      ),
    ],
  )
}

fn gallery_filtered_page(
  filter: GalleryFilter,
  filter_event: fn(GalleryFilter) -> a,
  open_modal_event,
) -> Element(a) {
  let filter_category =
    categories
    |> list.filter_map(fn(category) {
      let #(_, category_filter, items) = category
      case filter, category_filter {
        Ear(_), Ear(_) | Facial(_), Facial(_) | Body(_), Body(_) ->
          Ok(filter_category_list(items, filter_event, filter))
        _, _ -> Error(Nil)
      }
    })
  html.div(
    [
      attribute.class("min-h-screen"),
    ],
    [
      html.div([attribute.class("max-w-7xl mx-auto p-6 ")], [
        html.div([attribute.class("flex flex-col gap-5")], [
          header(filter),
          other_filters(filter_event, filter),
          html.div([attribute.class("flex-col lg:flex-row flex")], [
            element.fragment(filter_category),
            html.div([], [
              html.div([attribute.class("flex-1")], [
                gallery_grid(filter, open_modal_event),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  )
}

fn other_filters(
  filter_event: fn(GalleryFilter) -> a,
  current_filter: GalleryFilter,
) -> Element(a) {
  let all_filters = [
    #("OREJA", Ear(EarAll)),
    #("FACIALES", Facial(FacialAll)),
    #("CORPORALES", Body(BodyAll)),
  ]
  html.div([attribute.class("lg:pr-10")], [
    filter_category_list(all_filters, filter_event, current_filter),
  ])
}

fn header(filter: GalleryFilter) -> Element(b) {
  let title = case filter {
    All -> "Explora nuestro trabajo"
    Ear(_) -> "Perforaciones de oreja"
    Facial(_) -> "Perforaciones faciales"
    Body(_) -> "Perforaciones corporales"
  }
  html.h1(
    [
      attribute.class(
        "text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-wide",
      ),
      attribute.style("font-family", "'Dark Reborn', sans-serif"),
    ],
    [element.text(title)],
  )
}

fn filter_category_list(
  items: List(#(String, GalleryFilter)),
  filter_event,
  current_filter: GalleryFilter,
) {
  html.div(
    [attribute.class("flex flex-wrap pb-5 lg:pb-0")],
    items
      |> list.map(fn(item) {
        let #(name, filter) = item
        let is_active = filter == current_filter
        html.button(
          [
            attribute.class(
              "block min-w-max text-left px-2 py-2 text-white hover:bg-white/30 transition-all duration-300"
              <> case is_active {
                True -> " pl-3 bg-white/20 font-bold"
                False -> ""
              },
            ),
            event.on_click(filter_event(filter)),
          ],
          [
            element.text(case is_active {
              True -> "✧ " <> name
              False -> name
            }),
          ],
        )
      }),
  )
}

fn gallery_grid(filter: GalleryFilter, open_modal_event) -> Element(b) {
  let images = get_filtered_images(filter)
  html.div(
    [
      attribute.class(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6",
      ),
    ],
    images
      |> list.map(fn(img) {
        let #(image, _) = img
        html.button(
          [
            attribute.class(
              "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group ",
            ),
            event.on_click(open_modal_event(
              image,
              list.map(images, fn(i) { i.0 }),
            )),
          ],
          [
            html.img([
              attribute.src(image.src),
              attribute.class(
                "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
              ),
              attribute.alt(image.alt),
            ]),
          ],
        )
      }),
  )
}

fn get_filtered_images(
  filter: GalleryFilter,
) -> List(#(modal.Image, GalleryFilter)) {
  let all_images = [
    // Ear piercings
    #(
      modal.Image("/priv/static/lobulo.jpeg", "Perforación de lóbulo"),
      Ear(Lobulo),
    ),
    #(modal.Image("/priv/static/flat.jpeg", "Perforación flat"), Ear(Flat)),
    #(
      modal.Image("/priv/static/industrial.jpeg", "Perforación industrial"),
      Ear(Industrial),
    ),
    #(modal.Image("/priv/static/oreja.jpeg", "Perforación hélix"), Ear(Helix)),

    //modal.Image( Facial piercings
    #(
      modal.Image("/priv/static/nostril-1.jpeg", "Perforación nostril"),
      Facial(Nostril),
    ),
    #(
      modal.Image("/priv/static/nostril-2.jpeg", "Perforación nostril"),
      Facial(Nostril),
    ),
    #(
      modal.Image("/priv/static/nostril-3.jpeg", "Perforación nostril"),
      Facial(Nostril),
    ),
    #(
      modal.Image("/priv/static/nostril-4.jpeg", "Perforación nostril"),
      Facial(Nostril),
    ),
    #(
      modal.Image("/priv/static/nostril-5.jpeg", "Perforación nostril"),
      Facial(Nostril),
    ),
    #(
      modal.Image("/priv/static/ceja-1.heic", "Perforación de ceja"),
      Facial(Ceja),
    ),
    #(
      modal.Image("/priv/static/ceja-2.jpeg", "Perforación de ceja"),
      Facial(Ceja),
    ),
    #(
      modal.Image("/priv/static/venom.jpeg", "Perforación venom"),
      Facial(Venom),
    ),
    #(
      modal.Image("/priv/static/lengua-1.jpeg", "Perforación de lengua"),
      Facial(Lengua),
    ),
    #(
      modal.Image("/priv/static/lengua-2.jpeg", "Perforación de lengua"),
      Facial(Lengua),
    ),

    //modal.Image( Body piercings  
    #(
      modal.Image("/priv/static/ombligo.jpeg", "Perforación de ombligo"),
      Body(Ombligo),
    ),
    #(
      modal.Image("/priv/static/microdermal.jpeg", "Microdermal"),
      Body(Microdermal),
    ),
    #(modal.Image("/priv/static/cuerpo.heic", "Surface"), Body(Surface)),
  ]

  case filter {
    All -> all_images
    // Broad category filters
    Ear(EarAll) ->
      all_images
      |> list.filter(fn(img) {
        case img.1 {
          Ear(_) -> True
          _ -> False
        }
      })
    Facial(FacialAll) ->
      all_images
      |> list.filter(fn(img) {
        case img.1 {
          Facial(_) -> True
          _ -> False
        }
      })
    Body(BodyAll) ->
      all_images
      |> list.filter(fn(img) {
        case img.1 {
          Body(_) -> True
          _ -> False
        }
      })
    // Specific subcategory filters
    specific_filter ->
      all_images
      |> list.filter(fn(img) { img.1 == specific_filter })
  }
}
