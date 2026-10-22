# Products — sirf EK file update karni hai: `products.json`

Website ka poora catalog `products.json` se chalta hai. Asal products atay hi
sirf is file me entries daalo — website khud live catalog dikha degi.
File khaali (`"products": []`) ho to site imaandaar "Nayi collection jald aa
rahi hai — WhatsApp par poochain" wali halat dikhati hai. **Kabhi sample/jaali
product ya andazay ki qeemat mat daalna — sirf asal stock, asal qeemat.**

## Format

Har product ek object hai:

```json
{
  "products": [
    {
      "id": "premium-lawn-3pc",
      "name": "Premium Lawn 3 Piece",
      "urdu": "پریمیم لان تھری پیس",
      "category": "ladies",
      "fabric": "Pure lawn shirt, cambric trouser, voile dupatta",
      "retail": 2450,
      "wholesale": 2150,
      "badge": "New",
      "photo": ""
    }
  ]
}
```

## Fields

| Field | Zaroori? | Tafseel |
|---|---|---|
| `name` | **Haan** | Product ka naam (English) |
| `retail` | **Haan** | Parchoon qeemat — sirf number, comma nahi (masalan `2450`) |
| `category` | Na ho to ladies | `ladies`, `gents` ya `kids` |
| `wholesale` | Nahi | Wholesale qeemat (number). Na do to retail wali hi dikhegi |
| `urdu` | Nahi | Urdu naam |
| `fabric` | Nahi | Kapray ki tafseel ek line me |
| `badge` | Nahi | Chhota label, masalan `New` ya `Premium` |
| `photo` | Nahi | Photo ka path/URL. Khali ho to imaandaar "tasveer jald aa rahi hai" panel dikhta hai |
| `id` | Nahi | Na do to naam se khud ban jata hai |

Note: upar wali example sirf **format samjhane** ke liye hai — ye asal product
nahi hai. Asal entries Maaz ke diye hue naam + qeemat se bhari jayengi.
