<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // status_change, comment, mention, tag_added, file_added, assignment, created, updated, deleted
            $table->string('subject_type'); // App\Models\Project, App\Models\TaskList, App\Models\Task
            $table->unsignedBigInteger('subject_id');
            $table->string('action'); // e.g., "created", "updated status", "assigned", etc.
            $table->string('target')->nullable(); // e.g., Task ID, TaskList name
            $table->string('target_url')->nullable(); // Link to the target
            $table->json('status')->nullable(); // {text: "Completed", color: "green"}
            $table->json('tags')->nullable(); // [{text: "Bug", color: "red"}]
            $table->text('comment')->nullable(); // Comment content
            $table->string('assignee')->nullable(); // Assignee name
            $table->string('file_name')->nullable(); // Attached file name
            $table->json('old_values')->nullable(); // Previous values for comparison
            $table->json('new_values')->nullable(); // New values for comparison
            $table->timestamps();

            $table->index(['subject_type', 'subject_id']);
            $table->index(['user_id', 'created_at']);
            $table->index('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
