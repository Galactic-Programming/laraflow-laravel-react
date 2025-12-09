<?php

namespace Database\Seeders;

use App\Enums\TaskLabel;
use App\Models\Label;
use Illuminate\Database\Seeder;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create all predefined labels from the enum
        foreach (TaskLabel::cases() as $taskLabel) {
            Label::updateOrCreate(
                ['name' => $taskLabel],
                [
                    'color' => $taskLabel->color(),
                    'description' => $taskLabel->description(),
                    'category' => $taskLabel->category(),
                    'sort_order' => $taskLabel->sortOrder(),
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('All '.count(TaskLabel::cases()).' labels seeded successfully (including Other)!');
    }
}
