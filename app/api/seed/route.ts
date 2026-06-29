import { NextResponse } from "next/server";
import { insertRecipe } from "@/lib/sql";
import type { RecipeWriteInput } from "@/lib/sql";
import type { Category } from "@/lib/types";

const SEED: RecipeWriteInput[] = [
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
