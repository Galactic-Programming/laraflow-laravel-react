import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { DangerZone } from '@/components/settings';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { useRef } from 'react';

export interface DeleteUserProps {
    /** Whether to wrap in DangerZone styling */
    showDangerZone?: boolean;
    /** Custom warning title */
    warningTitle?: string;
    /** Custom warning description */
    warningDescription?: string;
}

export function DeleteUser({
    showDangerZone = true,
    warningTitle = 'Warning',
    warningDescription = 'Please proceed with caution, this cannot be undone.',
}: DeleteUserProps) {
    const passwordInput = useRef<HTMLInputElement>(null);

    const deleteButton = (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    data-test="delete-user-button"
                >
                    Delete account
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    Are you sure you want to delete your account?
                </DialogTitle>
                <DialogDescription>
                    Once your account is deleted, all of its resources
                    and data will also be permanently deleted. Please
                    enter your password to confirm you would like to
                    permanently delete your account.
                </DialogDescription>

                <Form
                    {...ProfileController.destroy.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onError={() => passwordInput.current?.focus()}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ resetAndClearErrors, processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="sr-only"
                                >
                                    Password
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            resetAndClearErrors()
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                    asChild
                                >
                                    <button
                                        type="submit"
                                        data-test="confirm-delete-user-button"
                                    >
                                        Delete account
                                    </button>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );

    if (!showDangerZone) {
        return deleteButton;
    }

    return (
        <DangerZone
            title={warningTitle}
            description={warningDescription}
        >
            {deleteButton}
        </DangerZone>
    );
}

export default DeleteUser;
