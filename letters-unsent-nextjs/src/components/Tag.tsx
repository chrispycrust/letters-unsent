
interface TagProps { 
    content: string;
    style: string;
}

export default function Tag({
    content,
    style
}: TagProps) {
    return (
        <span
            className={style}
        >
            {content}
        </span>
    )
}