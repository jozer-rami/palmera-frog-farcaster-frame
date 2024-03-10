export function getErrorJSX(title: string): any {
    return (
        <div style={{ display: 'flex', backgroundColor:'black',
            alignItems: 'center', width: '100vw', height: '100vh',
            justifyContent: 'center', textAlign: 'center', flexDirection: 'column'
        }}>
            <p style={{color: 'white', fontSize: '42px', maxWidth: '70%'}}> {title}</p>
        </div>
    )
}

