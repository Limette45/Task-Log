const STORAGE_KEY = "studyRecordData";


let data = loadData();

let currentDate =
    getTodayString();


function getTodayString() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return {
                records: {},
                reviewSubjects: []
            };

        }


        const parsed =
            JSON.parse(saved);


        return {

            records:
                parsed.records || {},

            reviewSubjects:
                parsed.reviewSubjects || []

        };

    } catch (error) {

        console.error(
            "Failed to load data:",
            error
        );


        return {
            records: {},
            reviewSubjects: []
        };

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


function getTodayDateObject() {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return today;
}


function dateToObject(dateString) {

    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;
}


function compareDates(
    dateA,
    dateB
) {

    const a =
        dateToObject(dateA);

    const b =
        dateToObject(dateB);


    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
}


function isToday() {

    return (
        currentDate ===
        getTodayString()
    );

}


function getRecord(date) {

    if (!data.records[date]) {

        data.records[date] = {

            vocab: {},

            lang: {},

            review: {}

        };

    }


    if (
        !data.records[date].vocab
    ) {

        data.records[date].vocab =
            {};

    }


    if (
        !data.records[date].lang
    ) {

        data.records[date].lang =
            {};

    }


    if (
        !data.records[date].review
    ) {

        data.records[date].review =
            {};

    }


    return data.records[date];

}


function formatDate(
    dateString
) {

    const date =
        dateToObject(
            dateString
        );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =========================================
   HISTORY DATE RANGE

   Today + previous 9 days
   = 10 days total
========================================= */

function getHistoryDates() {

    const dates = [];


    /*
     * Use the actual current date,
     * not currentDate.
     *
     * This means History always shows
     * the real today and the 9 days before it.
     */

    const today =
        dateToObject(
            getTodayString()
        );


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const date =
            new Date(
                today
            );


        date.setDate(
            date.getDate() - i
        );


        dates.push(
            dateToString(date)
        );

    }


    /*
     * Newest date first
     */

    dates.sort(
        function (a, b) {

            return b.localeCompare(a);

        }
    );


    return dates;

}


/* =========================================
   MAIN RENDER
========================================= */

function render() {

    document.getElementById(
        "dateDisplay"
    ).textContent =
        formatDate(
            currentDate
        );


    const record =
        getRecord(
            currentDate
        );


    renderFixedChecks(
        document.querySelectorAll(
            ".fixed-check"
        ),
        record
    );


    renderReview(
        record
    );


    updateEditability();


    saveData();

}


function renderFixedChecks(
    elements,
    record
) {

    elements.forEach(
        input => {

            const category =
                input.dataset.category;


            const item =
                input.dataset.item;


            input.checked =
                Boolean(
                    record[
                        category
                    ][
                        item
                    ]
                );

        }
    );

}


function renderReview(
    record
) {

    const container =
        document.getElementById(
            "reviewList"
        );


    container.innerHTML =
        "";


    data.reviewSubjects.forEach(
        (
            subject,
            index
        ) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "review-item";


            const label =
                document.createElement(
                    "label"
                );


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.checked =
                Boolean(
                    record.review[index]
                );


            checkbox.dataset.reviewIndex =
                index;


            checkbox.addEventListener(
                "change",
                () => {

                    if (!isToday()) {

                        checkbox.checked =
                            Boolean(
                                record.review[index]
                            );

                        return;

                    }


                    record.review[index] =
                        checkbox.checked;


                    saveData();

                }
            );


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                subject;


            label.appendChild(
                checkbox
            );


            label.appendChild(
                text
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-review";


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Delete subject";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteReviewSubject(
                        index
                    );

                }
            );


            wrapper.appendChild(
                label
            );


            wrapper.appendChild(
                deleteButton
            );


            container.appendChild(
                wrapper
            );

        }
    );

}


function updateEditability() {

    const editable =
        isToday();


    document
        .querySelectorAll(
            ".fixed-check"
        )
        .forEach(
            input => {

                input.disabled =
                    !editable;

            }
        );


    const addButton =
        document.getElementById(
            "addReview"
        );


    /*
     * Review subjects themselves can be
     * managed independently from the
     * daily check status.
     */

    addButton.disabled =
        false;


    document
        .querySelectorAll(
            ".delete-review"
        )
        .forEach(
            button => {

                button.disabled =
                    false;

            }
        );


    document
        .querySelectorAll(
            ".section"
        )
        .forEach(
            section => {

                if (editable) {

                    section.classList.remove(
                        "read-only"
                    );

                } else {

                    section.classList.add(
                        "read-only"
                    );

                }

            }
        );

}


/* =========================================
   FIXED CHECKBOXES
========================================= */

document
    .querySelectorAll(
        ".fixed-check"
    )
    .forEach(
        input => {

            input.addEventListener(
                "change",
                () => {

                    if (!isToday()) {

                        render();

                        return;

                    }


                    const record =
                        getRecord(
                            currentDate
                        );


                    const category =
                        input.dataset.category;


                    const item =
                        input.dataset.item;


                    record[
                        category
                    ][
                        item
                    ] =
                        input.checked;


                    saveData();

                }
            );

        }
    );


/* =========================================
   PREVIOUS DAY
========================================= */

document
    .getElementById(
        "prevDay"
    )
    .addEventListener(
        "click",
        () => {

            const date =
                dateToObject(
                    currentDate
                );


            date.setDate(
                date.getDate() - 1
            );


            currentDate =
                dateToString(
                    date
                );


            render();

        }
    );


/* =========================================
   NEXT DAY
========================================= */

document
    .getElementById(
        "nextDay"
    )
    .addEventListener(
        "click",
        () => {

            const date =
                dateToObject(
                    currentDate
                );


            date.setDate(
                date.getDate() + 1
            );


            currentDate =
                dateToString(
                    date
                );


            render();

        }
    );


/* =========================================
   DATE TO STRING
========================================= */

function dateToString(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================
   ADD REVIEW SUBJECT
========================================= */

document
    .getElementById(
        "addReview"
    )
    .addEventListener(
        "click",
        () => {

            const subject =
                prompt(
                    "Enter a Review subject:"
                );


            if (
                subject === null
            ) {

                return;

            }


            const trimmed =
                subject.trim();


            if (!trimmed) {

                return;

            }


            if (
                data.reviewSubjects
                    .includes(trimmed)
            ) {

                alert(
                    "This subject already exists."
                );

                return;

            }


            data.reviewSubjects.push(
                trimmed
            );


            saveData();


            render();

        }
    );


/* =========================================
   DELETE REVIEW SUBJECT
========================================= */

function deleteReviewSubject(
    index
) {

    const subject =
        data.reviewSubjects[
            index
        ];


    const confirmed =
        confirm(
            `Delete "${subject}" from Review?`
        );


    if (!confirmed) {

        return;

    }


    data.reviewSubjects.splice(
        index,
        1
    );


    /*
     * Remove this subject's check
     * from every stored day.
     */

    Object.keys(
        data.records
    ).forEach(
        date => {

            const oldReview =
                data.records[date]
                    .review || {};


            const newReview =
                {};


            data.reviewSubjects.forEach(
                (
                    _,
                    newIndex
                ) => {

                    let oldIndex =
                        newIndex;


                    if (
                        newIndex >= index
                    ) {

                        oldIndex =
                            newIndex + 1;

                    }


                    if (
                        oldReview[
                            oldIndex
                        ]
                    ) {

                        newReview[
                            newIndex
                        ] = true;

                    }

                }
            );


            data.records[date]
                .review =
                newReview;

        }
    );


    saveData();


    render();

}


/* =========================================
   INITIAL RENDER
========================================= */

render();
