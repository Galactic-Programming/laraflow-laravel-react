<?php

namespace Database\Factories;

use App\Enums\TaskLabel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Label>
 */
class LabelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $label = fake()->randomElement(TaskLabel::cases());

        return [
            'name' => $label,
            'color' => $label->color(),
            'description' => $label->description(),
            'category' => $label->category(),
            'sort_order' => $label->sortOrder(),
            'is_active' => true,
        ];
    }

    /**
     * Create a specific label type.
     */
    public function forLabel(TaskLabel $label): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $label,
            'color' => $label->color(),
            'description' => $label->description(),
            'category' => $label->category(),
            'sort_order' => $label->sortOrder(),
        ]);
    }

    /**
     * Indicate that the label is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create the "Other" label specifically.
     */
    public function other(): static
    {
        return $this->forLabel(TaskLabel::Other);
    }
}
