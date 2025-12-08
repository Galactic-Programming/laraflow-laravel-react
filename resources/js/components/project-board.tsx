import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Settings } from 'lucide-react';

// Types
export interface TeamMember {
    id: number;
    avatar: string;
    name?: string;
}

export interface Project {
    id: number;
    title: string;
    subtitle: string;
    progress: number;
    timeLeft: string;
    date: string;
    color: string;
    progressColor: string;
    badgeColor: string;
    icon: string;
    team: TeamMember[];
}

// Sub-components
interface ProjectCardProps {
    project: Project;
    onSettingsClick?: (project: Project) => void;
}

function ProjectCard({ project, onSettingsClick }: ProjectCardProps) {
    return (
        <Card className={`${project.color} relative overflow-hidden border-0`}>
            <CardContent className="p-6">
                {/* Settings Icon */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 h-auto p-1"
                    onClick={() => onSettingsClick?.(project)}
                >
                    <Settings className="h-4 w-4" />
                </Button>

                {/* Date */}
                <div className="mb-4 text-sm opacity-90">{project.date}</div>

                {/* Project Icon */}
                <div className="mb-4 text-4xl">{project.icon}</div>

                {/* Project Title */}
                <div className="mb-6">
                    <h3 className="mb-1 text-lg leading-tight font-semibold">
                        {project.title}
                    </h3>
                    <p className="text-sm opacity-90">{project.subtitle}</p>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm opacity-90">Progress</span>
                        <span className="text-sm font-semibold">
                            {project.progress}%
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/30">
                        <div
                            className={`${project.progressColor} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between">
                    {/* Team Avatars */}
                    <TeamAvatars team={project.team} />

                    {/* Time Left Badge */}
                    <Badge
                        className={`${project.badgeColor} border-0 text-white`}
                    >
                        {project.timeLeft}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

interface TeamAvatarsProps {
    team: TeamMember[];
    maxDisplay?: number;
}

function TeamAvatars({ team, maxDisplay = 3 }: TeamAvatarsProps) {
    const displayedMembers = team.slice(0, maxDisplay);
    const remainingCount = team.length - maxDisplay;

    return (
        <div className="flex -space-x-2">
            {displayedMembers.map((member, index) => (
                <div
                    key={`${member.id}-${index}`}
                    className="h-8 w-8 overflow-hidden rounded-full border-2 border-white"
                    style={{ zIndex: displayedMembers.length - index }}
                >
                    <img
                        src={member.avatar}
                        alt={member.name ?? `Team member ${member.id}`}
                        className="h-full w-full object-cover"
                    />
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-muted text-xs font-medium"
                    style={{ zIndex: 0 }}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}

// Main Component
interface ProjectBoardProps {
    projects: Project[];
    title?: string;
    description?: string;
    onNewProject?: () => void;
    onProjectSettings?: (project: Project) => void;
    showHeader?: boolean;
}

export default function ProjectBoard({
    projects,
    title = 'Projects Board',
    description = 'List of your ongoing projects',
    onNewProject,
    onProjectSettings,
    showHeader = true,
}: ProjectBoardProps) {
    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                {showHeader && (
                    <div className="mb-8 flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">{title}</h1>
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        {onNewProject && (
                            <Button onClick={onNewProject}>
                                <Plus />
                                New Project
                            </Button>
                        )}
                    </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onSettingsClick={onProjectSettings}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground">
                            No projects found
                        </p>
                        {onNewProject && (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={onNewProject}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create your first project
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Export sub-components for reuse
export { ProjectCard, TeamAvatars };
