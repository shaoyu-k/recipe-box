import { NextResponse } from "next/server";
import { insertRecipe } from "@/lib/sql";
import type { RecipeWriteInput } from "@/lib/sql";
import type { Category } from "@/lib/types";

const SEED: RecipeWriteInput[] = [
  {
    title: "Singapore Hotplate Egg Tofu",
    category: "Chinese" as Category,
    type: "link",
    ingredients:
      "EGG TOFU:\n1 tube egg tofu (160g), cut into discs\nOil for deep frying\n\nGRAVY:\n1 onion or shallot, sliced\n1 tsp garlic, minced\n1 tsp ginger, minced\n100 g beef mince\n5 prawns, peeled\n2 tbsp oyster sauce\n1 tbsp light soy sauce\n1 tsp dark soy sauce\n1 cup chicken stock (or water)\n5 baby corn\n½ carrot, sliced\nHandful baby bok choy\nCornstarch slurry (1 tbsp cornstarch + 3-4 tbsp water)\n1 tsp sesame oil\n¼ tsp ground white pepper\n\nHOTPLATE:\n2 eggs, beaten",
    instructions:
      "1. Cut egg tofu tube in middle, gently squeeze out. Slice into discs. Pat dry.\n2. Deep fry in medium oil until golden brown. Drain on paper towels.\n3. Sauté onion, garlic, ginger in oil until fragrant.\n4. Add beef mince, cook ~80% done. Add prawns, cook until pink.\n5. Season with oyster sauce, light soy, dark soy.\n6. Add chicken stock. Add hard veggies (baby corn, carrots). Bring to boil.\n7. Add leafy greens. Thicken with cornstarch slurry.\n8. Finish with sesame oil and white pepper.\n9. Heat hotplate/cast iron. Add oil, pour beaten eggs, swirl.\n10. When eggs are just setting, top with fried tofu, pour gravy over.\n11. Serve immediately while sizzling with rice.",
    notes: "Nomadette Eats recipe. Classic Singapore zi char dish. No hotplate? Use regular pan — tastes the same! Deep frying tofu = no flipping needed.",
    photoUrl: null,
    sourceUrl: "https://youtu.be/xj8ibrGZmSw",
    sourceImage: null,
    tried: false,
    favorite: false,
  },
  {
    title: "Singapore Chicken Laksa",
    category: "Other" as Category,
    type: "link",
    ingredients:
      "CHICKEN STOCK:\n500 g chicken carcass/spare parts\n1 whole onion\n2-3 garlic cloves\n2 litres water\n300 g chicken meat (for topping)\n\nLAKSA PASTE:\n100 ml dried chilli paste (or 10 dried chillies, soaked)\n5 red chillies\n1 medium onion (or 2-3 shallots)\n2-3 garlic cloves\n4 candlenuts\n20 g ginger\n20 g galangal\n20 g fresh turmeric (or 1 tsp turmeric powder)\n2 lemongrass stalks (inner white core)\n20 g belachan (optional)\n30 g dried shrimps, soaked (optional)\n1 tbsp coriander seeds\n\nLAKSA GRAVY:\nLaksa paste (from above)\n1.5-2 litres chicken broth\n400 ml coconut cream\n1 tbsp salt\n1 tbsp brown sugar\n1 pack fried tofu puffs (taopok)\n\nNOODLE ASSEMBLY:\n4 servings laksa noodles\n300 g cooked chicken, shredded\nBlanched bok choy\nBoiled eggs\nSpicy sambal (optional)",
    instructions:
      "1. Sear chicken carcass and meat in oil until surface cooked. Add onion, garlic, 2L water. Boil then simmer.\n2. After 20 min, remove chicken meat. Check cooked, shred for topping.\n3. Continue simmering stock at least 1 hour, then strain.\n4. Blend all paste ingredients until smooth.\n5. Heat oil in pot. Fry laksa paste over LOW heat until fragrant and darkened (pecah minyak).\n6. Add coconut cream, stir, bring to a boil.\n7. Add chicken stock, season with salt and sugar. Add tofu puffs.\n8. Cook noodles per packet. Assemble in bowls: noodles, shredded chicken, eggs, veg, gravy.\n9. Serve with sambal on the side.",
    notes: "Nomadette recipe by Sha. Singapore-style. Serves 4. Key: sear chicken first to avoid gamey stock. Fry paste on low until dark and oil separates.",
    photoUrl: null,
    sourceUrl: "https://nomadette.com/chicken-laksa/",
    sourceImage: null,
    tried: false,
    favorite: false,
  },
  {
    title: "Supreme Soy Sauce Noodles 豉油皇炒面",
    category: "Chinese" as Category,
    type: "link",
    ingredients:
      "250ml hot water\n1 tsp sugar\n1 tsp chicken stock powder (optional)\n1 tbsp oyster sauce\n1 tbsp light soy sauce\n2.5 tbsp dark soy sauce\nWhite pepper to taste\n1 tbsp sesame oil\n6 cloves garlic (chopped)\n3 stalks spring onion\n500g egg noodles (Hokkien noodles)\n160g bean sprouts\nCooking oil",
    instructions:
      "1. Mix sauce ingredients in a bowl. Set aside.\n2. Heat wok with 1 tbsp oil over medium-high heat.\n3. Fry chopped garlic, then add white parts of spring onions.\n4. Add noodles and stir-fry briefly to remove alkaline taste.\n5. Add bean sprouts and toss together.\n6. Stir sauce again, pour over noodles, toss until absorbed.\n7. Add green spring onion parts, stir briefly, serve immediately.",
    notes: "Spice N' Pans recipe by Roland. 3.1M views — their most popular!",
    photoUrl: null,
    sourceUrl: "https://www.youtube.com/watch?v=V0zulzQeAfI",
    sourceImage: null,
    tried: false,
    favorite: false,
  },
  {
    title: "Thai Glass Noodles w/ Prawns 泰式冬粉虾",
    category: "Thai" as Category,
    type: "link",
    ingredients:
      "300 ml water\n½ tsp chicken stock powder\n1 tsp sugar\n2 tbsp fish sauce\n3 tbsp oyster sauce\n1 tbsp dark soya sauce\n1 tbsp sesame oil\n300 g prawns (shell on, deveined)\n150 g glass noodles (tang hoon)\n40 g ginger (sliced)\n1 bulb garlic (lightly smashed)\n4 stalks cilantro roots\n½ tbsp ground white pepper\n½ tbsp ground black pepper\nSpring onion & cilantro for garnish",
    instructions:
      "1. Mix sauce (water, stock powder, sugar, fish sauce, oyster sauce, dark soya, sesame oil).\n2. Soak glass noodles 10-15 min. Drain.\n3. Pour sauce over noodles and prawns. Marinate 10-15 min.\n4. Heat claypot/pan with oil. Cook prawns ~80% done. Remove.\n5. In same pot, fry ginger, garlic, cilantro roots + peppers.\n6. Add noodles + half the marinade. Cover 1-2 min.\n7. Return prawns on top + remaining marinade. Cover 1-2 min.\n8. Garnish with spring onion + cilantro. Cover 1 min. Serve.",
    notes: "Spice N' Pans recipe. 248K views. Serves 3-4 as main, 6 as side.",
    photoUrl: null,
    sourceUrl: "https://youtu.be/F1oPAXfXuLI",
    sourceImage: null,
    tried: false,
    favorite: false,
  },
];

export async function POST() {
  const results: { title: string; id: string; status: string }[] = [];

  for (const recipe of SEED) {
    try {
      const created = await insertRecipe(recipe);
      results.push({
        title: created.title,
        id: created.id,
        status: "created",
      });
    } catch (err) {
      results.push({
        title: recipe.title,
        id: "",
        status: `error: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
  }

  return NextResponse.json({ seeded: results.length, results });
}
