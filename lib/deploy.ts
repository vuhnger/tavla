export const isNewDeploy = (current: string | undefined, latest: string | null | undefined) => !!current && !!latest && current !== latest;
