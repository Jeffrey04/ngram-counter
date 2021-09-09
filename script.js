function swindow(list, size) {
  return _.reduce(
    _.range(list.length - size + 1),
    (current, index) => {
      return _.concat(current, _.join(_.slice(list, index, index + size), ""));
    },
    []
  );
}

function posting_build(postings, token_list) {
  return _.reduce(
    _.filter(token_list, (token) => token.length > 0),
    (current, incoming) => _.update(current, incoming, (n) => (n ? n + 1 : 1)),
    postings
  );
}

function ngram_breaker(n, content_list) {
  return _.reduce(
    content_list,
    (current, incoming) => posting_build(current, swindow(incoming, n)),
    {}
  );
}

function phrase_breaker(content) {
  return _.reduce(
    _.trim(content).split(/\r?\n/),
    (current, incoming) => {
      return _.concat(
        current,
        _.filter(
          _.trim(incoming).split(/[，。「」？！；：『』（）——［］……\s]/),
          (phrase) => _.trim(phrase).length > 0
        )
      );
    },
    []
  );
}

function populate(elements, container) {
  container.empty().append(elements);
}

function tokens_build(tokens) {
  let [min, max] = _.over([Math.min, Math.max]).apply({}, _.values(tokens)),
    step = (max - min) / 6;

  return _.map(tokens, (count, token) => {
    return $($("#badge-template").html())
      .addClass(`fs-${7 - Math.floor((count - min) / step)}`)
      .prepend(`${token} `)
      .find("span.bg-secondary")
      .append(count)
      .end();
  });
}

function filter_n(n) {
  return (x) => x > $(`#${n}gram`).parent().find("select").val();
}

$(() => {
  $("#content").keyup((e) => {
    let phrases = phrase_breaker(e.target.value);

    _.forEach(_.range(1, 5), (n) => {
      populate(
        tokens_build(_.pickBy(ngram_breaker(n, phrases), filter_n(n))),
        $(`#${n}gram`)
      );
    });
  });

  $(".card select").change(() => {
    $("#content").keyup();
  });
});
