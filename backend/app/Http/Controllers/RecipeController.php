<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeResource;
use Illuminate\Http\Request;
use App\Models\Recipe;
use Carbon\Carbon;


class RecipeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 12;
        $recipes = Recipe::paginate($perPage);
        return RecipeResource::collection($recipes);
    }

    public function allRecipes()
    {
        $recipes = Recipe::all();
        return RecipeResource::collection($recipes);
    }

    public function store(Request $request)
{
    // Validate your incoming request...
    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'prep_time' => 'required|integer',
        'opis' => 'nullable|string',
        'slika' => 'nullable|string',
        'ingredients' => 'required|array',
        'ingredients.*.id' => 'required|integer|exists:ingredients,id',
        'ingredients.*.quantity' => 'required|integer|min:0',
        'written_by' => 'nullable|string',
        'sku' => 'nullable|string|unique:recipes',
        'stock' => 'required|boolean',
        'price' => 'nullable|numeric',
    ]);

    $recipe = new Recipe();
    $recipe->name = $request->name;
    $recipe->description = $request->description;
    $recipe->prep_time = $request->prep_time;
    $recipe->opis = $request->opis;
    $recipe->sku = $request->sku;
    $recipe->stock = $request->stock;
    $recipe->price = $request->price;
    $recipe->written_by = auth()->user()->name; // Set the current user's name as the author

    // Handle image path (now coming from image selection, not file upload)
    if ($request->filled('slika')) {
        $recipe->slika = $request->slika; // This is now the image path from the media library
    }

    $recipe->save(); // Save recipe first to get its ID

    // Handle ingredients (many-to-many relationship)
    $ingredients = $request->input('ingredients'); // Expecting ingredients as an array

    foreach ($ingredients as $ingredient) {
        // Attach ingredients with their quantity to the recipe
        $recipe->ingredients()->attach($ingredient['id'], ['quantity' => $ingredient['quantity']]);
    }

    // Return response with the full URL for the image
    return response()->json([
        'message' => 'Recipe created successfully.',
        'recipe' => [
            'id' => $recipe->id,
            'name' => $recipe->name,
            'description' => $recipe->description,
            'prep_time' => $recipe->prep_time,
            'opis' => $recipe->opis,
            'slika' => $recipe->slika ? url('storage/' . $recipe->slika) : null, // Full URL or null
        ],
    ]);
}

    public function show(Recipe $recipe)
    {
        return new RecipeResource($recipe);
    }

    public function update(Request $request, $id)
{
    // First, retrieve the recipe to ensure it exists
    $recipe = Recipe::findOrFail($id);

    // Validate the request data
    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'prep_time' => 'required|integer',
        'sku' => 'nullable|string|unique:recipes,sku,' . $id, // Use $id instead of $recipe->id
        'stock' => 'required|boolean',
        'price' => 'nullable|numeric',
    ]);

    // Update the recipe properties
    $recipe->name = $request->input('name') ?? ''; 
    $recipe->sku = $request->input('sku') ?? '-';
    $recipe->stock = $request->input('stock') ?? 1;
    $recipe->price = $request->input('price') ?? 2; // Ensure this is being set
    $recipe->description = $request->input('description') ?? '';
    $recipe->prep_time = $request->input('prep_time') ?? '';
    $recipe->opis = $request->input('opis') ?? '';
    
    // Handle ingredients if necessary
    // You may want to update the ingredients here as well

    // Save the updated recipe
    $recipe->save();

    return response()->json(['message' => 'Recipe updated successfully', 'data' => $recipe]);
}

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();
        return response()->json(['message' => 'Recipe deleted']);
    }

}